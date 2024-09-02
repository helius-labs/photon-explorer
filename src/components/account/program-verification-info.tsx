"use client"

import React, { useState, useEffect } from "react";
import { useProgramVerification } from '@/hooks/useProgramVerification';
import { VerificationStatus } from "@/types/verifiable-build";
import LottieLoader from "../common/lottie-loading";
import loadingBarAnimation from "@/../public/assets/animations/loadingBar.json";
import { Card } from "../ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Folder, File, ChevronRight, ChevronDown, Copy, Check } from 'lucide-react';
import { formatDate } from "@/utils/dateFormatter";

interface ProgramVerificationInfoProps {
  programId: string;
}

interface RepoFile {
  path: string;
  type: 'file' | 'tree';
  content?: string;
}

interface TreeNode {
  name: string;
  type: 'file' | 'tree';
  children: TreeNode[];
  path: string;
}

const ProgramVerificationInfo: React.FC<ProgramVerificationInfoProps> = ({ programId }) => {
  const { verificationStatus, isLoading, error } = useProgramVerification(programId);
  const [showRawJson, setShowRawJson] = useState<boolean>(false);
  const [repoStructure, setRepoStructure] = useState<TreeNode | null>(null);
  const [isRepoLoading, setIsRepoLoading] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<RepoFile | null>(null);
  const [showRepoStructure, setShowRepoStructure] = useState<boolean>(false);

  useEffect(() => {
    if (verificationStatus?.repo_url) {
      setIsRepoLoading(true);
      const [, , , owner, repo, , commitSha] = verificationStatus.repo_url.split('/');
      fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/${commitSha}?recursive=1`)
        .then(response => response.json())
        .then(data => {
          if (data.tree) {
            const root: TreeNode = { name: repo, type: 'tree', children: [], path: '' };
            data.tree.forEach((item: RepoFile) => {
              addToTree(root, item.path.split('/'), item.type);
            });
            setRepoStructure(root);
          }
        })
        .catch(error => console.error('Error fetching repo structure:', error))
        .finally(() => setIsRepoLoading(false));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verificationStatus]);

  const addToTree = (node: TreeNode, pathParts: string[], type: 'file' | 'tree') => {
    if (pathParts.length === 1) {
      node.children.push({ name: pathParts[0], type, children: [], path: node.path + '/' + pathParts[0] });
    } else {
      let child = node.children.find(c => c.name === pathParts[0]);
      if (!child) {
        child = { name: pathParts[0], type: 'tree', children: [], path: node.path + '/' + pathParts[0] };
        node.children.push(child);
      }
      addToTree(child, pathParts.slice(1), type);
    }
  };

  const fetchFileContent = async (path: string) => {
    const [, , , owner, repo] = verificationStatus!.repo_url.split('/');
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`);
    const data = await response.json();
    return atob(data.content);
  };

  const handleFileClick = async (file: RepoFile) => {
    if (file.type === 'file' && !file.content) {
      const content = await fetchFileContent(file.path);
      setSelectedFile({ ...file, content });
    } else {
      setSelectedFile(file);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LottieLoader animationData={loadingBarAnimation} className="h-32 w-32" />
      </div>
    );
  }

  if (error) {
    return <div className="error">{error.message}</div>;
  }

  return (
    <div className="space-y-8">
      {verificationStatus && (
        <Card className="col-span-12 mx-[-1rem] mb-10 overflow-hidden md:mx-0 relative dark:bg-black dark:border-gray-800">
          <div className="absolute top-2 right-2 z-10 flex space-x-2 p-2 rounded">
          <Button
            onClick={() => setShowRawJson(false)}
            variant={showRawJson ? "secondary" : "default"}
            size="sm"
          >
            Parsed
          </Button>
          <Button
            onClick={() => setShowRawJson(true)}
            variant={showRawJson ? "default" : "secondary"}
            size="sm"
          >
            Raw JSON
          </Button>
          </div>
          <div className="p-8 pt-16">
            {showRawJson ? (
              <pre className="whitespace-pre-wrap">
                {JSON.stringify(verificationStatus, null, 2)}
              </pre>
            ) : (
              <VerificationInfo verificationStatus={verificationStatus} />
            )}
          </div>
        </Card>
      )}
      
      {verificationStatus && verificationStatus.is_verified && (
        <Card className="col-span-12 mx-[-1rem] mb-10 overflow-hidden md:mx-0 relative dark:bg-black dark:border-gray-800">
          <div className="flex flex-row justify-between p-8">
            <h2 className="text-xl font-semibold mb-4 dark:text-white">Repository Structure</h2>
            <Button 
              onClick={() => setShowRepoStructure(!showRepoStructure)} 
              variant={showRepoStructure ? "default" : "secondary"} 
              size="sm"              
            >
              {showRepoStructure ? 'Show Structure' : 'Hide Structure'}
            </Button>
          </div>
          {showRepoStructure && (
              <RepoStructureView
                repoStructure={repoStructure}
                isRepoLoading={isRepoLoading}
                onFileClick={handleFileClick}
                selectedFile={selectedFile}
              />
            )}
        </Card>
      )}
    </div>
  );
};

const VerificationInfo: React.FC<{ 
  verificationStatus: VerificationStatus;
}> = ({ verificationStatus }) => {
  return (
    <div className="space-y-4 text-gray-800 dark:text-gray-200">
      <h1 className="text-2xl font-semibold mb-4">Program Verification</h1>
      <div className="flex items-center">
        <span className="font-semibold mr-2">Status:</span>
        <Badge variant={verificationStatus.is_verified ? "success" : "destructive"}>
          {verificationStatus.is_verified ? "Verified" : "Not Verified"}
        </Badge>
      </div>
      <div>
        <span className="font-semibold">Message:</span> {verificationStatus.message}
      </div>
      {verificationStatus.is_verified && (
        <>
          <div className="flex flex-row space-x-1">
            <span className="font-semibold">On-chain Hash:</span>
            <code className="text-orange-500 dark:text-orange-400">{verificationStatus.on_chain_hash}</code>
          </div>
          <div className="flex flex-row space-x-1">
            <span className="font-semibold">Executable Hash:</span> 
            <code className="text-orange-500 dark:text-orange-400">{verificationStatus.executable_hash}</code>
          </div>
          <div className="flex flex-row space-x-1">
            <span className="font-semibold">Last Verified:</span>
            <span>{formatDate(verificationStatus.last_verified_at)}</span> 
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-semibold">Repository:</span>
            <a href={verificationStatus.repo_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 dark:text-blue-400 hover:underline flex items-center">
              View Source <ExternalLink className="ml-1 h-4 w-4" />
            </a>
          </div>
        </>
      )}
    </div>
  );
};

const RepoStructureView: React.FC<{ 
  repoStructure: TreeNode | null;
  isRepoLoading: boolean;
  onFileClick: (file: RepoFile) => void;
  selectedFile: RepoFile | null;
}> = ({ repoStructure, isRepoLoading, onFileClick, selectedFile }) => {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [isCopied, setIsCopied] = useState(false);

  const toggleFolder = (path: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(path)) {
        newSet.delete(path);
      } else {
        newSet.add(path);
      }
      return newSet;
    });
  };

  const renderTree = (node: TreeNode) => (
    <div key={node.path} className="ml-4">
      {node.type === 'tree' ? (
        <div>
          <span
            className="cursor-pointer flex items-center text-gray-800 dark:text-gray-200"
            onClick={() => toggleFolder(node.path)}
          >
            {expandedFolders.has(node.path) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            <Folder size={16} className="mr-1" />
            {node.name}
          </span>
          {expandedFolders.has(node.path) && node.children.map(child => renderTree(child))}
        </div>
      ) : (
        <div
          className="cursor-pointer flex items-center text-gray-800 dark:text-gray-200"
          onClick={() => onFileClick({ path: node.path, type: 'file' })}
        >
          <File size={16} className="mr-1" />
          {node.name}
        </div>
      )}
    </div>
  );

  const isPDF = (filename: string) => filename.toLowerCase().endsWith('.pdf');

  const copyToClipboard = async () => {
    if (selectedFile && selectedFile.content) {
      try {
        await navigator.clipboard.writeText(selectedFile.content);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
      } catch (err) {
        console.error('Failed to copy text: ', err);
      }
    }
  };

  return (
    <div className="p-8">
      {isRepoLoading ? (
        <p className="dark:text-white">Loading repository structure...</p>
      ) : (
        <div className="flex">
          <div className="w-1/3 overflow-auto max-h-96 border-r pr-4 dark:border-gray-800">
            {repoStructure && renderTree(repoStructure)}
          </div>
          <div className="w-2/3 pl-4">
            {selectedFile ? (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold dark:text-white">{selectedFile.path}</h3>
                  {!isPDF(selectedFile.path) && (
                    <Button
                      onClick={copyToClipboard}
                      variant="outline"
                      size="sm"
                      className="flex items-center"
                    >
                      {isCopied ? (
                        <>
                          <Check size={16} className="mr-1" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy size={16} className="mr-1" />
                          Copy
                        </>
                      )}
                    </Button>
                  )}
                </div>
                {isPDF(selectedFile.path) ? (
                  <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-md text-sm dark:text-gray-300">
                    Unsupported File Type
                  </div>
                ) : (
                  <pre className="whitespace-pre-wrap bg-gray-100 dark:bg-gray-900 p-4 rounded-md overflow-x-auto text-sm dark:text-gray-300">
                    <code>{selectedFile.content || 'Loading...'}</code>
                  </pre>
                )}
              </div>
            ) : (
              <p className="dark:text-white">Select a file to view its contents</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgramVerificationInfo;