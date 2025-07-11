import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Trash2, 
  Eye, 
  Code, 
  Type, 
  Video, 
  Image, 
  FileText, 
  ExternalLink,
  Upload
} from 'lucide-react';

interface ContentBlock {
  id: string;
  type: 'text' | 'video' | 'image' | 'code' | 'interactive' | 'embed';
  title?: string;
  content: string;
  metadata?: {
    duration?: number;
    url?: string;
    alt?: string;
    language?: string;
    width?: number;
    height?: number;
    autoplay?: boolean;
    controls?: boolean;
  };
}

interface RichContentEditorProps {
  initialContent?: ContentBlock[];
  onChange: (content: ContentBlock[]) => void;
  lessonType: 'VIDEO' | 'TEXT' | 'QUIZ' | 'ASSIGNMENT' | 'INTERACTIVE' | 'DOCUMENT';
}

const RichContentEditor: React.FC<RichContentEditorProps> = ({
  initialContent = [],
  onChange,
  lessonType
}) => {
  const [content, setContent] = useState<ContentBlock[]>(initialContent);
  const [previewMode, setPreviewMode] = useState(false);

  const addContentBlock = (type: ContentBlock['type']) => {
    const newBlock: ContentBlock = {
      id: `block-${Date.now()}`,
      type,
      title: '',
      content: '',
      metadata: type === 'video' ? { controls: true } : {}
    };

    const updatedContent = [...content, newBlock];
    setContent(updatedContent);
    onChange(updatedContent);
  };

  const updateContentBlock = (id: string, updates: Partial<ContentBlock>) => {
    const updatedContent = content.map(block => 
      block.id === id ? { ...block, ...updates } : block
    );
    setContent(updatedContent);
    onChange(updatedContent);
  };

  const removeContentBlock = (id: string) => {
    const updatedContent = content.filter(block => block.id !== id);
    setContent(updatedContent);
    onChange(updatedContent);
  };

  const moveBlock = (id: string, direction: 'up' | 'down') => {
    const index = content.findIndex(block => block.id === id);
    if (
      (direction === 'up' && index > 0) || 
      (direction === 'down' && index < content.length - 1)
    ) {
      const newContent = [...content];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      [newContent[index], newContent[targetIndex]] = [newContent[targetIndex], newContent[index]];
      setContent(newContent);
      onChange(newContent);
    }
  };

  const getBlockIcon = (type: ContentBlock['type']) => {
    switch (type) {
      case 'text': return <Type className="h-4 w-4" />;
      case 'video': return <Video className="h-4 w-4" />;
      case 'image': return <Image className="h-4 w-4" />;
      case 'code': return <Code className="h-4 w-4" />;
      case 'interactive': return <ExternalLink className="h-4 w-4" />;
      case 'embed': return <FileText className="h-4 w-4" />;
      default: return <Type className="h-4 w-4" />;
    }
  };

  const renderBlockEditor = (block: ContentBlock) => {
    return (
      <Card key={block.id} className="mb-4">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getBlockIcon(block.type)}
              <CardTitle className="text-sm capitalize">{block.type} Block</CardTitle>
              <Badge variant="outline" className="text-xs">{block.type}</Badge>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => moveBlock(block.id, 'up')}
                disabled={content.findIndex(b => b.id === block.id) === 0}
              >
                ↑
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => moveBlock(block.id, 'down')}
                disabled={content.findIndex(b => b.id === block.id) === content.length - 1}
              >
                ↓
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeContentBlock(block.id)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Title */}
          <div>
            <Label className="text-xs">Title (optional)</Label>
            <Input
              value={block.title || ''}
              onChange={(e) => updateContentBlock(block.id, { title: e.target.value })}
              placeholder="Block title..."
              className="text-sm"
            />
          </div>

          {/* Content based on type */}
          {block.type === 'text' && (
            <div>
              <Label className="text-xs">HTML Content</Label>
              <Textarea
                value={block.content}
                onChange={(e) => updateContentBlock(block.id, { content: e.target.value })}
                placeholder="Enter HTML content..."
                className="min-h-[120px] font-mono text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                You can use HTML tags like &lt;h2&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;ol&gt;, &lt;strong&gt;, etc.
              </p>
            </div>
          )}

          {block.type === 'video' && (
            <div className="space-y-3">
              <div>
                <Label className="text-xs">Video URL</Label>
                <Input
                  value={block.content}
                  onChange={(e) => updateContentBlock(block.id, { content: e.target.value })}
                  placeholder="https://example.com/video.mp4"
                  className="text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Duration (seconds)</Label>
                  <Input
                    type="number"
                    value={block.metadata?.duration || ''}
                    onChange={(e) => updateContentBlock(block.id, { 
                      metadata: { ...block.metadata, duration: Number(e.target.value) }
                    })}
                    placeholder="600"
                    className="text-sm"
                  />
                </div>
                <div className="flex items-center space-x-2 mt-4">
                  <input
                    type="checkbox"
                    checked={block.metadata?.controls !== false}
                    onChange={(e) => updateContentBlock(block.id, { 
                      metadata: { ...block.metadata, controls: e.target.checked }
                    })}
                    id={`controls-${block.id}`}
                  />
                  <Label htmlFor={`controls-${block.id}`} className="text-xs">Show controls</Label>
                </div>
              </div>
            </div>
          )}

          {block.type === 'image' && (
            <div className="space-y-3">
              <div>
                <Label className="text-xs">Image URL</Label>
                <Input
                  value={block.content}
                  onChange={(e) => updateContentBlock(block.id, { content: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                  className="text-sm"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label className="text-xs">Alt Text</Label>
                  <Input
                    value={block.metadata?.alt || ''}
                    onChange={(e) => updateContentBlock(block.id, { 
                      metadata: { ...block.metadata, alt: e.target.value }
                    })}
                    placeholder="Image description"
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs">Width (px)</Label>
                  <Input
                    type="number"
                    value={block.metadata?.width || ''}
                    onChange={(e) => updateContentBlock(block.id, { 
                      metadata: { ...block.metadata, width: Number(e.target.value) }
                    })}
                    placeholder="800"
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs">Height (px)</Label>
                  <Input
                    type="number"
                    value={block.metadata?.height || ''}
                    onChange={(e) => updateContentBlock(block.id, { 
                      metadata: { ...block.metadata, height: Number(e.target.value) }
                    })}
                    placeholder="600"
                    className="text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {block.type === 'code' && (
            <div className="space-y-3">
              <div>
                <Label className="text-xs">Code</Label>
                <Textarea
                  value={block.content}
                  onChange={(e) => updateContentBlock(block.id, { content: e.target.value })}
                  placeholder="console.log('Hello, world!');"
                  className="min-h-[120px] font-mono text-sm"
                />
              </div>
              <div>
                <Label className="text-xs">Programming Language</Label>
                <Input
                  value={block.metadata?.language || ''}
                  onChange={(e) => updateContentBlock(block.id, { 
                    metadata: { ...block.metadata, language: e.target.value }
                  })}
                  placeholder="javascript"
                  className="text-sm"
                />
              </div>
            </div>
          )}

          {block.type === 'interactive' && (
            <div className="space-y-3">
              <div>
                <Label className="text-xs">Description</Label>
                <Textarea
                  value={block.content}
                  onChange={(e) => updateContentBlock(block.id, { content: e.target.value })}
                  placeholder="Description of the interactive content..."
                  className="min-h-[60px] text-sm"
                />
              </div>
              <div>
                <Label className="text-xs">Interactive URL</Label>
                <Input
                  value={block.metadata?.url || ''}
                  onChange={(e) => updateContentBlock(block.id, { 
                    metadata: { ...block.metadata, url: e.target.value }
                  })}
                  placeholder="https://example.com/interactive"
                  className="text-sm"
                />
              </div>
            </div>
          )}

          {block.type === 'embed' && (
            <div>
              <Label className="text-xs">Embed URL (YouTube, etc.)</Label>
              <Input
                value={block.content}
                onChange={(e) => updateContentBlock(block.id, { content: e.target.value })}
                placeholder="https://www.youtube.com/embed/dQw4w9WgXcQ"
                className="text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                Use embed URLs for YouTube, Vimeo, or other embeddable content
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderPreview = () => {
    return (
      <div className="space-y-6">
        {content.map((block) => (
          <Card key={block.id}>
            <CardContent className="p-6">
              {block.title && (
                <h3 className="text-lg font-semibold mb-4">{block.title}</h3>
              )}
              
              {block.type === 'text' && (
                <div 
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: block.content }}
                />
              )}
              
              {block.type === 'video' && (
                <video 
                  controls={block.metadata?.controls}
                  className="w-full rounded"
                  style={{
                    maxWidth: block.metadata?.width ? `${block.metadata.width}px` : '100%',
                    maxHeight: block.metadata?.height ? `${block.metadata.height}px` : 'auto'
                  }}
                >
                  <source src={block.content} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              )}
              
              {block.type === 'image' && (
                <img
                  src={block.content}
                  alt={block.metadata?.alt || 'Content image'}
                  className="max-w-full h-auto rounded"
                  style={{
                    maxWidth: block.metadata?.width ? `${block.metadata.width}px` : '100%',
                    maxHeight: block.metadata?.height ? `${block.metadata.height}px` : 'auto'
                  }}
                />
              )}
              
              {block.type === 'code' && (
                <pre className="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto">
                  <code>{block.content}</code>
                </pre>
              )}
              
              {block.type === 'interactive' && (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <ExternalLink className="h-8 w-8 mx-auto mb-2 text-gray-500" />
                  <p className="text-gray-600 mb-2">{block.content}</p>
                  {block.metadata?.url && (
                    <Button variant="outline" size="sm">
                      Open Interactive Content
                    </Button>
                  )}
                </div>
              )}
              
              {block.type === 'embed' && (
                <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                  <iframe
                    src={block.content}
                    className="absolute inset-0 w-full h-full rounded"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Rich Content Editor</h3>
        <div className="flex items-center gap-2">
          <Button
            variant={previewMode ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPreviewMode(!previewMode)}
          >
            <Eye className="h-4 w-4 mr-1" />
            {previewMode ? 'Edit' : 'Preview'}
          </Button>
        </div>
      </div>

      {!previewMode ? (
        <div>
          {/* Add Content Buttons */}
          <div className="mb-4 p-4 border rounded-lg bg-gray-50">
            <p className="text-sm text-gray-600 mb-3">Add content blocks:</p>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => addContentBlock('text')}
              >
                <Type className="h-4 w-4 mr-1" />
                Text
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => addContentBlock('video')}
              >
                <Video className="h-4 w-4 mr-1" />
                Video
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => addContentBlock('image')}
              >
                <Image className="h-4 w-4 mr-1" />
                Image
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => addContentBlock('code')}
              >
                <Code className="h-4 w-4 mr-1" />
                Code
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => addContentBlock('interactive')}
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                Interactive
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => addContentBlock('embed')}
              >
                <FileText className="h-4 w-4 mr-1" />
                Embed
              </Button>
            </div>
          </div>

          {/* Content Blocks */}
          <div>
            {content.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                <p className="text-gray-500">No content blocks yet. Add some content above!</p>
              </div>
            ) : (
              content.map(renderBlockEditor)
            )}
          </div>
        </div>
      ) : (
        <div>
          <h4 className="text-md font-medium mb-4">Content Preview</h4>
          {content.length === 0 ? (
            <div className="text-center py-8 border rounded-lg bg-gray-50">
              <p className="text-gray-500">No content to preview</p>
            </div>
          ) : (
            renderPreview()
          )}
        </div>
      )}
    </div>
  );
};

export default RichContentEditor;
