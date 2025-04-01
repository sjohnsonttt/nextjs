"use client";

import { useState, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { toast } from 'sonner';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/cjs/styles/prism';

const exampleTask = {
  SourcePath: "\\\\trustedtech.local\\ttt\\ProService\\Management Reporting",
  TargetPath: "https://contoso.sharepoint.com/sites/ProfressionalServices",
  TargetList: "Documents",
  TargetListRelativePath: "General/SubFolder/AnotherSubFolder",
};

const [theme, setTheme] = useState<'dark' | 'light'>('light');

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

  const [settings, setSettings] = useState({
    MigrateHiddenItems: false,
    MigrateItemsCreatedAfter: false,
    MigrateItemsModifiedAfter: false,
    SkipFilesWithExtensions: false,
    MigrateOneNoteNotebook: false,
  });

  const [customValues, setCustomValues] = useState({
    MigrateItemsCreatedAfter: '2016-05-22',
    MigrateItemsModifiedAfter: '2016-05-22',
    SkipFilesWithExtensions: 'txt:mp3',
  });

  const [showPreview, setShowPreview] = useState<boolean>(true);
  const [confirmClear, setConfirmClear] = useState<boolean>(false);



  const handleChange = (index: number, field: keyof Task, value: string) => {
    const updatedTasks = [...tasks];
    updatedTasks[index][field] = value;
    setTasks(updatedTasks);
  };

  const handleSettingToggle = (key: keyof typeof settings) => {
    setSettings({ ...settings, [key]: !settings[key] });
  };

  const handleCustomInputChange = (field: keyof typeof customValues, value: string) => {
    setCustomValues({ ...customValues, [field]: value });
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

  const clearAll = () => {
    setTasks([
      {
        SourcePath: '',
        TargetPath: '',
        TargetList: '',
        TargetListRelativePath: '',
      },
    ]);
    setSettings({
      MigrateHiddenItems: false,
      MigrateItemsCreatedAfter: false,
      MigrateItemsModifiedAfter: false,
      SkipFilesWithExtensions: false,
      MigrateOneNoteNotebook: false,
    });
    setCustomValues({
      MigrateItemsCreatedAfter: '2016-05-22',
      MigrateItemsModifiedAfter: '2016-05-22',
      SkipFilesWithExtensions: 'txt:mp3',
    });
    setConfirmClear(false);
    toast('Cleared all fields successfully.');
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

  const buildSettings = () => {
    const result: any = {};
    if (settings.MigrateHiddenItems) result.MigrateHiddenItems = true;
    if (settings.MigrateItemsCreatedAfter) result.MigrateItemsCreatedAfter = customValues.MigrateItemsCreatedAfter;
    if (settings.MigrateItemsModifiedAfter) result.MigrateItemsModifiedAfter = customValues.MigrateItemsModifiedAfter;
    if (settings.SkipFilesWithExtensions) result.SkipFilesWithExtensions = customValues.SkipFilesWithExtensions;
    if (settings.MigrateOneNoteNotebook) result.MigrateOneNoteNotebook = true;
    return result;
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
        Settings: buildSettings(),
      })),
    };

    const blob = new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'migration-tasks.json';
    a.click();
    URL.revokeObjectURL(url);
    toast('JSON file downloaded.' );
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
      Settings: buildSettings(),
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
      <div className="mb-6 space-y-4">
        <h2 className="text-lg font-semibold">Optional Settings</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Object.entries(settings).map(([key, value]) => (
            <label key={key} className="flex items-center gap-2">
              <Checkbox id={key} checked={value} onCheckedChange={() => handleSettingToggle(key as keyof typeof settings)} />
              {key}
            </label>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {settings.MigrateItemsCreatedAfter && (
            <Input
              type="date"
              value={customValues.MigrateItemsCreatedAfter}
              onChange={(e) => handleCustomInputChange('MigrateItemsCreatedAfter', e.target.value)}
            />
          )}
          {settings.MigrateItemsModifiedAfter && (
            <Input
              type="date"
              value={customValues.MigrateItemsModifiedAfter}
              onChange={(e) => handleCustomInputChange('MigrateItemsModifiedAfter', e.target.value)}
            />
          )}
          {settings.SkipFilesWithExtensions && (
            <Input
              placeholder="Extensions to skip (e.g. txt:mp3)"
              value={customValues.SkipFilesWithExtensions}
              onChange={(e) => handleCustomInputChange('SkipFilesWithExtensions', e.target.value)}
            />
          )}
        </div>
      </div>
      <div className="flex flex-wrap gap-4 mb-6">
        <Button onClick={addTask}>Add Task</Button>
        <Button onClick={handleDownload}>Download JSON</Button>
        <Button variant="secondary" onClick={() => setConfirmClear(true)}>Clear All</Button>
      </div>
      <Dialog open={confirmClear} onOpenChange={setConfirmClear}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure you want to clear everything?</DialogTitle>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setConfirmClear(false)}>Cancel</Button>
            <Button variant="destructive" onClick={clearAll}>Yes, clear all</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Collapsible open={showPreview} onOpenChange={setShowPreview} className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="mb-2 text-left font-semibold">
            {showPreview ? '▼ Hide JSON Preview' : '► Show JSON Preview'}
          </Button>
          <div className="flex items-center gap-2 mb-2">
            <label htmlFor="theme-toggle">Preview Theme:</label>
              <select
                id="theme-toggle"
                value={theme}
                onChange={(e) => setTheme(e.target.value as 'light' | 'dark')}
                className="border rounded px-2 py-1 text-sm"
              >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              </select>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SyntaxHighlighter language="json" style={theme === 'dark' ? oneDark : oneLight} wrapLongLines>
            {JSON.stringify(previewJson, null, 2)}
          </SyntaxHighlighter>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
