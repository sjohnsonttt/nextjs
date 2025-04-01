"use client";
import { useState, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

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

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">SharePoint Migration JSON Builder</h1>
      <div className="mb-4">
        <input type="file" accept="application/json" onChange={handleFileUpload} />
      </div>
      {tasks.map((task, index) => (
        <Card key={index} className="mb-4">
          <CardContent className="space-y-4 py-4">
            <Input
              placeholder="SourcePath"
              value={task.SourcePath}
              onChange={(e) => handleChange(index, 'SourcePath', e.target.value)}
            />
            <Input
              placeholder="TargetPath"
              value={task.TargetPath}
              onChange={(e) => handleChange(index, 'TargetPath', e.target.value)}
            />
            <Input
              placeholder="TargetList"
              value={task.TargetList}
              onChange={(e) => handleChange(index, 'TargetList', e.target.value)}
            />
            <Input
              placeholder="TargetListRelativePath"
              value={task.TargetListRelativePath}
              onChange={(e) => handleChange(index, 'TargetListRelativePath', e.target.value)}
            />
            {tasks.length > 1 && (
              <Button variant="destructive" onClick={() => removeTask(index)}>Remove Task</Button>
            )}
          </CardContent>
        </Card>
      ))}
      <div className="flex flex-wrap gap-4">
        <Button onClick={addTask}>Add Task</Button>
        <Button onClick={handleDownload}>Download JSON</Button>
      </div>
    </div>
  );
}
