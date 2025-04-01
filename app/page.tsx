"use client";

import { useState, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/cjs/styles/prism';

const exampleTask = {
  SourcePath: "\\\\trustedtech.local\\ttt\\ProService\\Management Reporting",
  TargetPath: "https://contoso.sharepoint.com/sites/ProfressionalServices",
  TargetList: "Documents",
  TargetListRelativePath: "General/SubFolder/AnotherSubFolder",
};

type Task = {
  SourcePath: string;
  TargetPath: string;
  TargetList: string;
  TargetListRelativePath: string;
};

export default function SharePointJsonBuilder() {
  const [tasks, setTasks] = useState<Task[]>([
    {
      SourcePath: '',
      TargetPath: '',
      TargetList: '',
      TargetListRelativePath: '',
    },
  ]);
  const [showPreview, setShowPreview] = useState<boolean>(true);

  const handleChange = (index: number, field: keyof Task, value: string) => {
    const updatedTasks = [...tasks];
    updatedTasks[index][field] = value;
    setTasks(updatedTasks);
  };

  const addTask = () => {
    setTasks([
      ...tasks,
      {
        SourcePath: '',
        TargetPath: '',
        TargetList: '',
        TargetListRelativePath: '',
      },
    ]);
  };

  const removeTask = (index: number) => {
    const updatedTasks = tasks.filter((_, i) => i !== index);
    setTasks(updatedTasks);
  };

  const isValid = (task: Task) => {
    return (
      task.SourcePath.trim() !== '' &&
      task.TargetPath.trim() !== '' &&
      task.TargetList.trim() !== '' &&
      task.TargetListRelativePath.trim() !== ''
    );
  };

  const handleDownload = () => {
    const invalidTasks = tasks.filter((task) => !isValid(task));
    if (invalidTasks.length > 0) {
      alert('Please fill in all fields for each task before downloading.');
      return;
    }

    const json = {
      Tasks: tasks.map(task => ({
        ...task,
        Settings: {
          DefaultPackageFileCount: 0,
          MigrateSiteSettings: 0,
          MigrateRootFolder: true,
        },
      })),
    };

    const blob = new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'migration-tasks.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.Tasks && Array.isArray(json.Tasks)) {
          const importedTasks: Task[] = json.Tasks.map(({ SourcePath, TargetPath, TargetList, TargetListRelativePath }: any) => ({
            SourcePath: SourcePath || '',
            TargetPath: TargetPath || '',
            TargetList: TargetList || '',
            TargetListRelativePath: TargetListRelativePath || '',
          }));
          setTasks(importedTasks);
        }
      } catch (err) {
        alert('Failed to parse JSON file');
      }
    };
    reader.readAsText(file);
  };

  const loadExample = () => {
    setTasks([exampleTask]);
  };

  const previewJson = {
    Tasks: tasks.map(task => ({
      ...task,
      Settings: {
        DefaultPackageFileCount: 0,
        MigrateSiteSettings: 0,
        MigrateRootFolder: true,
      },
    })),
  };

  const prefersDark = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-4">
        <img src="/TTT_Logo_Mark.png" alt="Logo" className="h-8 w-8" />
          <h1 className="text-2xl font-bold">SharePoint Migration JSON Builder</h1>
    </div>
      <div className="mb-4 space-y-2">
        <input type="file" accept="application/json" onChange={handleFileUpload} />
        <Button variant="outline" onClick={loadExample}>Load Example</Button>
      </div>
      {tasks.map((task, index) => (
        <Card key={index} className="mb-4">
          <CardContent className="space-y-4 py-4">
            <Input
              placeholder="SourcePath (e.g. \\fileserver\share\folder)"
              value={task.SourcePath}
              onChange={(e) => handleChange(index, 'SourcePath', e.target.value)}
            />
            <Input
              placeholder="TargetPath (e.g. https://contoso.sharepoint.com/sites/Marketing)"
              value={task.TargetPath}
              onChange={(e) => handleChange(index, 'TargetPath', e.target.value)}
            />
            <Input
              placeholder="TargetList (e.g. Documents)"
              value={task.TargetList}
              onChange={(e) => handleChange(index, 'TargetList', e.target.value)}
            />
            <Input
              placeholder="TargetListRelativePath (e.g. General/SubFolder/AnotherSubFolder)"
              value={task.TargetListRelativePath}
              onChange={(e) => handleChange(index, 'TargetListRelativePath', e.target.value)}
            />
            {tasks.length > 1 && (
              <Button variant="destructive" onClick={() => removeTask(index)}>Remove Task</Button>
            )}
          </CardContent>
        </Card>
      ))}
      <div className="flex flex-wrap gap-4 mb-6">
        <Button onClick={addTask}>Add Task</Button>
        <Button onClick={handleDownload}>Download JSON</Button>
      </div>
      <Collapsible open={showPreview} onOpenChange={setShowPreview} className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="mb-2 text-left font-semibold">
            {showPreview ? '▼ Hide JSON Preview' : '► Show JSON Preview'}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SyntaxHighlighter language="json" style={prefersDark ? oneDark : oneLight} wrapLongLines>
            {JSON.stringify(previewJson, null, 2)}
          </SyntaxHighlighter>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
