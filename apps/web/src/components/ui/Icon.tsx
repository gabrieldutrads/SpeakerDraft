/**
 * Icon System - Unified icon component using Lucide React
 * Provides consistent sizing, styling, and accessibility across the app
 */

import {
  // Navigation
  ChevronLeft, ChevronRight, ChevronUp, ChevronDown,
  Menu, X, Search, Home, BookOpen, Calendar, Library, FileText,
  Settings, User, Bell, Moon, Sun, Monitor,

  // Bible
  Book, BookMarked, BookCopy, BookOpen as BibleBook,
  Search as BibleSearch, Copy, Share2, Star, Heart,
  ArrowLeft, ArrowRight, ArrowUp, ArrowDown,
  Type, Eye, EyeOff, Layers,

  // Actions
  Plus, Minus, Edit, Trash2, Download, Upload,
  Save, RefreshCw, RotateCcw, Maximize2, Minimize2,
  Printer, FileText as DocText, FileType2, FileType,

  // Bible specific
  Cross, Sparkles, Flame, Bird, Crown, Anchor,

  // UI
  Check, CheckCircle, AlertCircle, Info, HelpCircle,
  Lock, Unlock, Key, Shield,
  Filter, SortAsc, SortDesc, Grid, List,
  MoreHorizontal, MoreVertical, ChevronsUpDown,

  // Playback/Preaching
  Play, Pause, Square, SkipBack, SkipForward,
  FastForward, Rewind, Volume2, VolumeX,
  Timer, Clock, Target, Flag,

  // Typography
  Bold, Italic, Underline, Strikethrough, Code,
  Heading1, Heading2, Heading3, ListOrdered,
  Quote, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Link, Unlink, Image, Table, Highlighter,

  // Bible books
  ScrollText, BookCheck, BookHeart,

  // Misc
  Globe, Languages, Hash,
  Tag, Bookmark, BookmarkPlus, BookmarkMinus,
  History, Clock as HistoryClock, TrendingUp,
  Settings as Cog, Palette, Contrast,
  Sun as SunIcon, Moon as MoonIcon,

  type LucideIcon
} from 'lucide-react';

import { forwardRef, type SVGProps } from 'react';

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'ref'> {
  name: IconName;
  size?: number | string;
  strokeWidth?: number;
  className?: string;
  'aria-label'?: string;
  'aria-hidden'?: boolean;
}

export type IconName =
  // Navigation
  | 'chevron-left' | 'chevron-right' | 'chevron-up' | 'chevron-down'
  | 'menu' | 'x' | 'search' | 'home' | 'book-open' | 'calendar' | 'library' | 'file-text'
  | 'settings' | 'user' | 'bell' | 'moon' | 'sun' | 'monitor'

  // Bible
  | 'book' | 'book-marked' | 'book-copy' | 'bible-book'
  | 'bible-search' | 'copy' | 'share' | 'star' | 'heart'
  | 'arrow-left' | 'arrow-right' | 'arrow-up' | 'arrow-down'
  | 'type' | 'eye' | 'eye-off' | 'layers'

  // Actions
  | 'plus' | 'minus' | 'edit' | 'trash' | 'download' | 'upload'
  | 'save' | 'refresh' | 'rotate-ccw' | 'maximize' | 'minimize'
  | 'print' | 'doc-text' | 'file-pdf' | 'file-word'

  // Bible specific
  | 'cross' | 'sparkles' | 'flame' | 'dove' | 'crown' | 'anchor'

  // UI
  | 'check' | 'check-circle' | 'alert-circle' | 'info' | 'help-circle'
  | 'lock' | 'unlock' | 'key' | 'shield' | 'bell'
  | 'filter' | 'sort-asc' | 'sort-desc' | 'grid' | 'list'
  | 'more-horizontal' | 'more-vertical' | 'chevrons-up-down'

  // Playback/Preaching
  | 'play' | 'pause' | 'stop' | 'skip-back' | 'skip-forward'
  | 'fast-forward' | 'rewind' | 'volume-2' | 'volume-x'
  | 'timer' | 'clock' | 'target' | 'flag'

  // Typography
  | 'bold' | 'italic' | 'underline' | 'strikethrough' | 'code'
  | 'heading-1' | 'heading-2' | 'heading-3' | 'list' | 'list-ordered'
  | 'quote' | 'align-left' | 'align-center' | 'align-right' | 'align-justify'
  | 'link' | 'unlink' | 'image' | 'table' | 'highlighter'

  // Bible books
  | 'scroll-text' | 'book-mark' | 'book-check' | 'book-heart'

  // Misc
  | 'globe' | 'language' | 'translate' | 'hash'
  | 'tag' | 'bookmark' | 'bookmark-plus' | 'bookmark-minus'
  | 'history' | 'history-clock' | 'trending-up'
  | 'cog' | 'palette' | 'contrast'
  | 'sun-icon' | 'moon-icon';

const iconMap: Record<IconName, LucideIcon> = {
  // Navigation
  'chevron-left': ChevronLeft,
  'chevron-right': ChevronRight,
  'chevron-up': ChevronUp,
  'chevron-down': ChevronDown,
  'menu': Menu,
  'x': X,
  'search': Search,
  'home': Home,
  'book-open': BookOpen,
  'calendar': Calendar,
  'library': Library,
  'file-text': FileText,
  'settings': Settings,
  'user': User,
  'bell': Bell,
  'moon': Moon,
  'sun': Sun,
  'monitor': Monitor,

  // Bible
  'book': Book,
  'book-marked': BookMarked,
  'book-copy': BookCopy,
  'bible-book': BibleBook,
  'bible-search': BibleSearch,
  'copy': Copy,
  'share': Share2,
  'star': Star,
  'heart': Heart,
  'arrow-left': ArrowLeft,
  'arrow-right': ArrowRight,
  'arrow-up': ArrowUp,
  'arrow-down': ArrowDown,
  'type': Type,
  'eye': Eye,
  'eye-off': EyeOff,
  'layers': Layers,

  // Actions
  'plus': Plus,
  'minus': Minus,
  'edit': Edit,
  'trash': Trash2,
  'download': Download,
  'upload': Upload,
  'save': Save,
  'refresh': RefreshCw,
  'rotate-ccw': RotateCcw,
  'maximize': Maximize2,
  'minimize': Minimize2,
  'print': Printer,
  'doc-text': DocText,
  'file-pdf': FileType2,
  'file-word': FileType,

  // Bible specific
  'cross': Cross,
  'sparkles': Sparkles,
  'flame': Flame,
  'dove': Bird,
  'crown': Crown,
  'anchor': Anchor,

  // UI
  'check': Check,
  'check-circle': CheckCircle,
  'alert-circle': AlertCircle,
  'info': Info,
  'help-circle': HelpCircle,
  'lock': Lock,
  'unlock': Unlock,
  'key': Key,
  'shield': Shield,
  'filter': Filter,
  'sort-asc': SortAsc,
  'sort-desc': SortDesc,
  'grid': Grid,
  'list': List,
  'more-horizontal': MoreHorizontal,
  'more-vertical': MoreVertical,
  'chevrons-up-down': ChevronsUpDown,

  // Playback/Preaching
  'play': Play,
  'pause': Pause,
  'stop': Square,
  'skip-back': SkipBack,
  'skip-forward': SkipForward,
  'fast-forward': FastForward,
  'rewind': Rewind,
  'volume-2': Volume2,
  'volume-x': VolumeX,
  'timer': Timer,
  'clock': Clock,
  'target': Target,
  'flag': Flag,

  // Typography
  'bold': Bold,
  'italic': Italic,
  'underline': Underline,
  'strikethrough': Strikethrough,
  'code': Code,
  'heading-1': Heading1,
  'heading-2': Heading2,
  'heading-3': Heading3,
  'list-ordered': ListOrdered,
  'quote': Quote,
  'align-left': AlignLeft,
  'align-center': AlignCenter,
  'align-right': AlignRight,
  'align-justify': AlignJustify,
  'link': Link,
  'unlink': Unlink,
  'image': Image,
  'table': Table,
  'highlighter': Highlighter,

  // Bible books
  'scroll-text': ScrollText,
  'book-mark': BookMarked,
  'book-check': BookCheck,
  'book-heart': BookHeart,

  // Misc
  'globe': Globe,
  'language': Languages,
  'translate': Languages,
  'hash': Hash,
  'tag': Tag,
  'bookmark': Bookmark,
  'bookmark-plus': BookmarkPlus,
  'bookmark-minus': BookmarkMinus,
  'history': History,
  'history-clock': HistoryClock,
  'trending-up': TrendingUp,
  'cog': Cog,
  'palette': Palette,
  'contrast': Contrast,
  'sun-icon': SunIcon,
  'moon-icon': MoonIcon,
};

export const Icon = forwardRef<SVGSVGElement, IconProps>(
  ({ name, size = 20, strokeWidth = 2, className = '', 'aria-label': ariaLabel, 'aria-hidden': ariaHidden, ...props }, ref) => {
    const IconComponent = iconMap[name];

    if (!IconComponent) {
      console.warn(`Icon "${name}" not found in icon map`);
      return null;
    }

    return (
      <IconComponent
        ref={ref}
        width={size}
        height={size}
        strokeWidth={strokeWidth}
        className={className}
        aria-label={ariaLabel}
        aria-hidden={ariaHidden ?? !ariaLabel}
        {...props}
      />
    );
  }
);

Icon.displayName = 'Icon';

// Convenience components for common sizes
export const IconSm = ({ name, ...props }: Omit<IconProps, 'size'>) =>
  <Icon name={name} size={16} strokeWidth={2.5} {...props} />;

export const IconMd = ({ name, ...props }: Omit<IconProps, 'size'>) =>
  <Icon name={name} size={20} strokeWidth={2} {...props} />;

export const IconLg = ({ name, ...props }: Omit<IconProps, 'size'>) =>
  <Icon name={name} size={24} strokeWidth={2} {...props} />;

export const IconXl = ({ name, ...props }: Omit<IconProps, 'size'>) =>
  <Icon name={name} size={32} strokeWidth={1.5} {...props} />;

export default Icon;