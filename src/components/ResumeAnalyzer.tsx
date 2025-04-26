
import React, { useState, useCallback } from "react";
import axios from "axios";
import { useToast } from "@/components/ui/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { X, FileText, Check } from "lucide-react";

function ResumeAnalyzer() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files?.length) {
      setFile(files[0]);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "Error",
        description: "Please upload a resume first!",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(
        "http://localhost:8000/analyze_resume/",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      setResult(response.data);
      toast({
        title: "Success",
        description: "Resume analyzed successfully!",
        variant: "default",
      });
    } catch (error) {
      console.error("Error analyzing resume", error);
      toast({
        title: "Error",
        description: "Something went wrong while analyzing the resume.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatText = (text: string) => {
    return text
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
          Resume Analyzer
        </h1>
        <p className="text-gray-600">
          Upload your resume to analyze its match with different roles
        </p>
      </div>

      <Card className="p-8 mb-8">
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
            isDragging
              ? "border-purple-500 bg-purple-50"
              : "border-gray-300 hover:border-purple-400"
          }`}
          onDragEnter={handleDragIn}
          onDragLeave={handleDragOut}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center gap-4">
            <FileText className="w-12 h-12 text-purple-500" />
            <div className="space-y-2">
              <p className="text-lg font-medium">
                {file ? file.name : "Drop your resume here"}
              </p>
              <p className="text-sm text-gray-500">
                or click to browse from your computer
              </p>
            </div>
            <input
              type="file"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer inline-flex items-center px-4 py-2 bg-purple-50 text-purple-700 rounded-md hover:bg-purple-100 transition-colors"
            >
              Browse Files
            </label>
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <Button
            onClick={handleUpload}
            disabled={!file || isLoading}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Progress value={33} className="w-20" />
                Analyzing...
              </div>
            ) : (
              "Analyze Resume"
            )}
          </Button>
        </div>
      </Card>

      {result && (
        <div className="space-y-8 animate-fade-in">
          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
              Analysis Results
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                      Keywords Matched
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                      Match Score
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {result.role_percentages.map(([role, percent]: [string, number]) => (
                    <tr
                      key={role}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm text-gray-800">
                        {formatText(role)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div className="flex flex-wrap gap-1">
                          {result.matched_keywords[role]?.map(
                            (keyword: string) => (
                              <span
                                key={keyword}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                              >
                                {formatText(keyword)}
                              </span>
                            )
                          ) || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-24 p-[1px] rounded-full bg-gradient-to-r from-purple-600 to-blue-500">
                            <Progress
                              value={percent}
                              className="h-2 [&>div]:bg-gradient-to-r [&>div]:from-purple-600 [&>div]:to-blue-500"
                            />
                          </div>
                          <span className="text-gray-600">
                            {percent.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-r from-purple-50 to-blue-50">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
              Best Match
            </h2>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-full">
                <Check className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-lg font-medium text-gray-800">
                  {formatText(result.best_role[0])}
                </p>
                <p className="text-sm text-gray-600">
                  Match Score: {result.best_role[1].toFixed(1)}%
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

export default ResumeAnalyzer;
