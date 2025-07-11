import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize,
  Download,
  ExternalLink,
  CheckCircle,
  Clock,
  BookOpen,
  Video,
  FileText,
  Code,
  Image as ImageIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface LessonContent {
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
    poster?: string;
    caption?: string;
  };
}

interface LessonContentRendererProps {
  content: LessonContent[];
  onProgressUpdate?: (progress: number) => void;
  onTimeSpent?: (time: number) => void;
  onBookmark?: (contentId: string) => void;
  onNoteAdd?: (contentId: string, note: string) => void;
  bookmarkedItems?: string[];
  notes?: Record<string, string>;
  showProgress?: boolean;
  currentProgress?: number;
}

const LessonContentRenderer: React.FC<LessonContentRendererProps> = ({
  content,
  onProgressUpdate,
  onTimeSpent,
  onBookmark,
  onNoteAdd,
  bookmarkedItems = [],
  notes = {},
  showProgress = false,
  currentProgress = 0
}) => {
  const [videoStates, setVideoStates] = React.useState<Record<string, {
    isPlaying: boolean;
    isMuted: boolean;
    isFullscreen: boolean;
    currentTime: number;
    duration: number;
  }>>({});

  const [readingProgress, setReadingProgress] = React.useState(0);
  const [startTime] = React.useState(Date.now());

  // Track reading progress
  React.useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;
      setReadingProgress(Math.min(progress, 100));
      
      if (onProgressUpdate) {
        onProgressUpdate(progress);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [onProgressUpdate]);

  // Track time spent
  React.useEffect(() => {
    const interval = setInterval(() => {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      if (onTimeSpent) {
        onTimeSpent(timeSpent);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, onTimeSpent]);

  const handleVideoPlay = (contentId: string) => {
    setVideoStates(prev => ({
      ...prev,
      [contentId]: { ...prev[contentId], isPlaying: true }
    }));
  };

  const handleVideoPause = (contentId: string) => {
    setVideoStates(prev => ({
      ...prev,
      [contentId]: { ...prev[contentId], isPlaying: false }
    }));
  };

  const handleVideoTimeUpdate = (contentId: string, currentTime: number, duration: number) => {
    setVideoStates(prev => ({
      ...prev,
      [contentId]: { ...prev[contentId], currentTime, duration }
    }));
  };

  const handleVideoToggleMute = (contentId: string) => {
    setVideoStates(prev => ({
      ...prev,
      [contentId]: { ...prev[contentId], isMuted: !prev[contentId]?.isMuted }
    }));
  };

  const handleVideoToggleFullscreen = (contentId: string) => {
    setVideoStates(prev => ({
      ...prev,
      [contentId]: { ...prev[contentId], isFullscreen: !prev[contentId]?.isFullscreen }
    }));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderTextContent = (item: LessonContent) => (
    <div className="prose max-w-none prose-lg">
      {item.title && (
        <h3 className="text-xl font-semibold mb-4 text-gray-900">{item.title}</h3>
      )}
      <div 
        className="text-gray-700 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: item.content }}
      />
    </div>
  );

  const renderVideoContent = (item: LessonContent) => {
    const videoState = videoStates[item.id] || {
      isPlaying: false,
      isMuted: false,
      isFullscreen: false,
      currentTime: 0,
      duration: 0
    };

    return (
      <div className="relative group">
        {item.title && (
          <h3 className="text-xl font-semibold mb-4 text-gray-900">{item.title}</h3>
        )}
        <div className="relative bg-black rounded-lg overflow-hidden">
          <video
            className="w-full h-auto"
            controls
            poster={item.metadata?.poster}
            onPlay={() => handleVideoPlay(item.id)}
            onPause={() => handleVideoPause(item.id)}
            onTimeUpdate={(e) => {
              const video = e.target as HTMLVideoElement;
              handleVideoTimeUpdate(item.id, video.currentTime, video.duration);
            }}
            muted={videoState.isMuted}
          >
            <source src={item.metadata?.url || item.content} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          
          {/* Video Controls Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20"
                  onClick={() => {
                    const video = document.querySelector(`video[src="${item.metadata?.url || item.content}"]`) as HTMLVideoElement;
                    if (video) {
                      videoState.isPlaying ? video.pause() : video.play();
                    }
                  }}
                >
                  {videoState.isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <span className="text-sm">
                  {formatTime(videoState.currentTime)} / {formatTime(videoState.duration)}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20"
                  onClick={() => handleVideoToggleMute(item.id)}
                >
                  {videoState.isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20"
                  onClick={() => handleVideoToggleFullscreen(item.id)}
                >
                  {videoState.isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
        </div>
        {item.metadata?.caption && (
          <p className="text-sm text-gray-600 mt-2 italic">{item.metadata.caption}</p>
        )}
      </div>
    );
  };

  const renderImageContent = (item: LessonContent) => (
    <div className="space-y-2">
      {item.title && (
        <h3 className="text-xl font-semibold mb-4 text-gray-900">{item.title}</h3>
      )}
      <div className="relative">
        <img
          src={item.metadata?.url || item.content}
          alt={item.metadata?.alt || item.title || 'Lesson image'}
          className="w-full h-auto rounded-lg shadow-md"
          style={{
            maxWidth: item.metadata?.width ? `${item.metadata.width}px` : '100%',
            maxHeight: item.metadata?.height ? `${item.metadata.height}px` : 'auto'
          }}
        />
        {item.metadata?.caption && (
          <p className="text-sm text-gray-600 mt-2 italic">{item.metadata.caption}</p>
        )}
      </div>
    </div>
  );

  const renderCodeContent = (item: LessonContent) => (
    <div className="space-y-2">
      {item.title && (
        <h3 className="text-xl font-semibold mb-4 text-gray-900">{item.title}</h3>
      )}
      <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
        <div className="flex items-center justify-between mb-2">
          <Badge variant="secondary" className="text-xs">
            {item.metadata?.language || 'code'}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white"
            onClick={() => navigator.clipboard.writeText(item.content)}
          >
            Copy
          </Button>
        </div>
        <pre className="text-gray-100 text-sm">
          <code>{item.content}</code>
        </pre>
      </div>
    </div>
  );

  const renderInteractiveContent = (item: LessonContent) => (
    <div className="space-y-2">
      {item.title && (
        <h3 className="text-xl font-semibold mb-4 text-gray-900">{item.title}</h3>
      )}
      <Card className="border-2 border-dashed border-gray-300">
        <CardContent className="p-6">
          <div className="text-center">
            <div className="text-gray-400 mb-2">
              <Code className="h-8 w-8 mx-auto" />
            </div>
            <p className="text-gray-600">Interactive content: {item.content}</p>
            <p className="text-sm text-gray-500 mt-2">
              This interactive element will be implemented based on the content type.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderEmbedContent = (item: LessonContent) => (
    <div className="space-y-2">
      {item.title && (
        <h3 className="text-xl font-semibold mb-4 text-gray-900">{item.title}</h3>
      )}
      <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
        <iframe
          src={item.metadata?.url || item.content}
          className="w-full h-full"
          frameBorder="0"
          allowFullScreen
          title={item.title || 'Embedded content'}
        />
      </div>
    </div>
  );

  const renderContentItem = (item: LessonContent, index: number) => {
    const isBookmarked = bookmarkedItems.includes(item.id);
    const itemNotes = notes[item.id] || '';

    return (
      <div key={item.id} className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              {item.type.toUpperCase()}
            </Badge>
            {item.metadata?.duration && (
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="h-3 w-3 mr-1" />
                {formatTime(item.metadata.duration)}
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {onBookmark && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onBookmark(item.id)}
                className={isBookmarked ? 'text-yellow-600' : 'text-gray-400'}
              >
                <CheckCircle className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {item.type === 'text' && renderTextContent(item)}
          {item.type === 'video' && renderVideoContent(item)}
          {item.type === 'image' && renderImageContent(item)}
          {item.type === 'code' && renderCodeContent(item)}
          {item.type === 'interactive' && renderInteractiveContent(item)}
          {item.type === 'embed' && renderEmbedContent(item)}

          {/* Notes Section */}
          {onNoteAdd && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <textarea
                placeholder="Add notes for this section..."
                value={itemNotes}
                onChange={(e) => onNoteAdd(item.id, e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
                rows={3}
              />
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      {showProgress && (
        <div className="sticky top-4 z-10 bg-white border rounded-lg p-3 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Reading Progress</span>
            <span className="text-sm text-gray-600">{Math.round(currentProgress)}%</span>
          </div>
          <Progress value={currentProgress} className="h-2" />
        </div>
      )}

      {/* Content Items */}
      <div className="space-y-8">
        {content.map((item, index) => renderContentItem(item, index))}
      </div>

      {/* Reading Progress Indicator */}
      {!showProgress && (
        <div className="fixed bottom-4 right-4 bg-white border rounded-lg p-3 shadow-lg">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium">{Math.round(readingProgress)}%</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default LessonContentRenderer; 