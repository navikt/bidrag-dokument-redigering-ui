# Problem Description

The task is to create a custom WYSIWYG HTML Editor using React, built on top of a well-maintained open-source library such as Lexical, QuillJS, or DraftJS. The editor must support the following features:

- Adding a title to the document
- Copy and paste functionality
- Inserting images
- Saving changes
- Locking certain areas of the document to prevent editing
- Adding tables
- Creating new pages
- Additional features as needed

Changes should be saved in the backend as JSON files, allowing users to load and continue editing later. Once editing is complete, the JSON should be convertible to a PDF file.

For initial editing, the editor should accept HTML or RTF files and convert them into an editable format within the editor.

---

# Technology Evaluation

## Editor Libraries Comparison

### 1. **Lexical** (Meta - Facebook)
**Status**: Modern, actively maintained
- **Pros**:
  - Built by Meta specifically for modern React apps
  - Excellent TypeScript support
  - Highly extensible plugin architecture
  - Strong performance with large documents
  - Built-in support for complex content structures
  - Great documentation and community growth
  - Better handling of nested structures (tables, lists within tables)
  
- **Cons**:
  - Smaller ecosystem compared to Quill (though growing)
  - Steeper learning curve due to extensibility
  
- **Best for**: Large-scale, feature-rich applications
- **Recommendation**: **RECOMMENDED** for this use case

### 2. **QuillJS**
**Status**: Mature, community-maintained
- **Pros**:
  - Well-established with large ecosystem
  - Large community and plenty of examples
  - Good documentation
  - Simple API for basic features
  - Many pre-built modules and themes
  
- **Cons**:
  - Not designed for modern React patterns
  - Harder to integrate with React due to direct DOM manipulation
  - Less extensible for complex features
  - Performance issues with very large documents
  
- **Best for**: Simple editors with standard features

### 3. **DraftJS** (Facebook)
**Status**: Maintained but showing age
- **Pros**:
  - Solid immutable state management
  - Good React integration
  - Proven in production at Facebook/Meta
  
- **Cons**:
  - Less active development
  - Harder to implement advanced features
  - Performance issues with complex documents
  - Community moving towards Lexical
  
- **Best for**: Legacy projects or simple editors

### 4. **Tiptap** (Community-driven)
**Status**: Actively maintained, rapidly growing
- **Pros**:
  - Built on top of ProseMirror (battle-tested foundation)
  - Excellent React integration with hooks
  - Modern TypeScript support
  - Very easy to learn and use
  - Extensive plugin ecosystem
  - Great documentation with interactive examples
  - Headless architecture (completely customizable UI)
  - Excellent for rapid development
  - Strong community and examples online
  - Good table and list plugin support
  - Lightweight compared to Lexical
  - Supports collaborative editing (with Yjs integration)
  - Great starter templates
  - Open source core (MIT license)
  
- **Cons**:
  - Smaller than Quill ecosystem (but growing fast)
  - Built on ProseMirror which has learning curve for deep customization
  - Less battle-tested in very large-scale production apps
  - **Premium extensions available (some advanced features require paid license)**
  - **Not suitable if strict "free-only" requirement**
  
- **Best for**: Modern React apps that need rapid development with budget for optional premium features
- **Limitation**: Some advanced extensions (Collaboration Pro, etc.) are paid

### 5. **Editor.js** (Community-driven, Codex)
**Status**: Actively maintained, growing ecosystem
- **Pros**:
  - Block-based editor (similar to WordPress Gutenberg)
  - Zero dependencies - extremely lightweight (~60KB)
  - Excellent TypeScript support
  - Plugin architecture with many community plugins
  - Great for modern web applications
  - Clean JSON output format
  - Supports real-time collaboration
  - Good documentation
  - Active community
  - MIT License - completely free and open source
  - Growing plugin marketplace
  - Excellent for structured content
  
- **Cons**:
  - Block-based approach (different UX than traditional WYSIWYG)
  - Not traditional word processor style (more content-focused)
  - Steeper learning curve for users expecting Word-like interface
  - Less mature table support compared to others
  - Fewer pre-built plugins than Quill or Tiptap
  - React integration requires wrapper component
  - Not ideal for complex formatting requirements
  - Plugins ecosystem smaller than established editors
  
- **Best for**: Modern content editors, blog platforms, structured document creation
- **Limitation**: Block-based paradigm may confuse users expecting traditional word processor

---

## Recommendation: **Lexical** (For Free/Open-Source Only)

**Important Note**: Since the requirement is to use a **free library**, we revise our recommendation to **Lexical** instead of Tiptap:

| Criteria | Lexical | Tiptap* | QuillJS | DraftJS | Editor.js |
|----------|---------|--------|---------|---------|-----------|
| **React Integration** | Good | **Excellent** | Poor | Good | Fair |
| **Learning Curve** | Moderate | **Easy** | Easy | Moderate | Moderate |
| **Customization** | Very High | **Very High** | Low | Low | High |
| **Plugin Ecosystem** | Good | **Excellent** | Excellent | Poor | Growing |
| **TypeScript Support** | Excellent | **Excellent** | Basic | Good | Excellent |
| **Table Support** | Good | **Excellent** | Poor | Poor | Limited |
| **List Support** | Good | **Good** | Good | Fair | Good |
| **Word-like UI** | **Yes** | Yes | Yes | No | No (Block-based) |
| **Font Controls** | Yes | Yes | Limited | No | Limited |
| **Performance** | Excellent | **Good** | Fair | Fair | Excellent |
| **Maintenance** | Active (Meta) | **Active (Community)** | Community | Community | Active |
| **Rapid Development** | Moderate | **Fast** | Fast | Slow | Moderate |
| **Documentation** | Good | **Excellent** | Good | Fair | Good |
| **Free License** | ✅ MIT | ✅ MIT (core) | ✅ BSD | ✅ Apache 2.0 | ✅ MIT |
| **No Paid Extensions** | ✅ Full | ❌ Premium extensions | ✅ Full | ✅ Full | ✅ Full |

*Tiptap is excellent but requires budget for some premium extensions

### Why Lexical is the Best Choice for Word-like Free Editor:

1. **Completely Free**: MIT licensed, no hidden paid features or premium extensions
2. **Enterprise-Grade Backing**: Maintained by Meta (Facebook), ensuring long-term support
3. **Excellent for Complex Features**: All required features (tables, locked regions, images, etc.) can be implemented without paid add-ons
4. **Strong TypeScript Support**: Better type safety than Tiptap for large projects
5. **Word-like User Experience**: Traditional WYSIWYG with toolbar, font controls, proper list/table support - exactly what users expect
6. **Extensible Plugin System**: Comprehensive plugin architecture for custom features
7. **Performance**: Better performance characteristics for large documents
8. **Production Ready**: Used in production at scale by Meta itself
9. **No Licensing Concerns**: Completely open source without any commercial restrictions

### Comparison with Alternatives:

- **Tiptap**: Easier to start, but requires paid extensions for advanced features
- **Editor.js**: Great for block-based content, but not word processor style and limited table support
- **QuillJS**: Good but older, harder to customize for complex requirements
- **DraftJS**: Too dated for modern applications

**Final Decision**: Go with **Lexical** for a fully free, open-source solution with traditional word processor UX, comprehensive features, and no licensing constraints.

---

# Implementation Plan

## 1. Architecture Overview

```
bidrag-dokument-redigering-ui/
├── src/
│   ├── pages/
│   │   └── dokumentredigering/
│   │       └── DokumentRedigeringPage.tsx
│   ├── components/
│   │   └── editor/
│   │       ├── Editor.tsx (Main editor component)
│   │       ├── EditorToolbar.tsx
│   │       ├── EditorContent.tsx
│   │       ├── plugins/
│   │       │   ├── ImagePlugin.tsx
│   │       │   ├── TablePlugin.tsx
│   │       │   ├── LockPlugin.tsx
│   │       │   └── PageBreakPlugin.tsx
│   │       └── utils/
│   │           ├── editorState.ts
│   │           ├── htmlImporter.ts
│   │           ├── rtfImporter.ts
│   │           ├── pdfExporter.ts
│   │           └── nodeTypes.ts
│   ├── api/
│   │   └── documentApi.ts (API calls for save/load)
│   └── types/
│       └── editor.ts (TypeScript interfaces)
```

## 2. Technology Stack

### Core Libraries
| Technology | Version | Purpose |
|-----------|---------|---------|
| **lexical** | ^0.18.0+ | Main editor framework |
| **@lexical/react** | ^0.18.0+ | React integration |
| **@lexical/list** | ^0.18.0+ | List support |
| **@lexical/table** | ^0.18.0+ | Table support |
| **@lexical/link** | ^0.18.0+ | Link support |
| **react** | ^18.0.0 | Framework |
| **typescript** | ^5.0.0 | Type safety |

### Import/Export Libraries
| Technology | Purpose | Notes |
|-----------|---------|-------|
| **html-to-text** | HTML to plain text | Initial conversion |
| **jsdom** | DOM parsing | Server-side HTML parsing |
| **mammoth** | RTF/DOCX to HTML | Professional conversion |
| **turndown** | HTML to Markdown | Alternative format |

### PDF Export
| Technology | Purpose | Notes |
|-----------|---------|-------|
| **jsPDF** | Simple PDF generation | Client-side, good for basic layouts |
| **html2canvas** + **jsPDF** | HTML to PDF | Preserves styling |
| **puppeteer** | Server-side PDF generation | Better quality, more control |
| **Recommendation** | Use html2canvas + jsPDF client-side with Puppeteer as fallback | Hybrid approach for best UX |

### State Management & Storage
| Technology | Purpose |
|-----------|---------|
| **React Context** + **useReducer** | Local state management |
| **LocalStorage** | Temporary draft storage |
| **Backend API** | Persistent storage (JSON) |

### Styling
| Technology | Purpose |
|-----------|---------|
| **Tailwind CSS** | Already in use |
| **CSS Modules** | Scoped editor styling |

---

## 3. Detailed Implementation Steps

### Step 1: Setup & Project Structure
```bash
# Install dependencies
npm install lexical @lexical/react @lexical/list @lexical/table @lexical/link
npm install mammoth html-to-text jsdom
npm install jspdf html2canvas
npm install axios (or existing HTTP client)
```

### Step 2: Create Editor Component Structure

**Editor.tsx** - Main wrapper component:
```typescript
interface EditorProps {
  documentId?: string;
  initialContent?: EditorStateType;
  onSave: (state: EditorStateType) => Promise<void>;
  readonly?: boolean;
}

// Uses LexicalComposer to initialize editor
// Manages editor state and auto-save
// Handles keyboard shortcuts
```

**EditorToolbar.tsx** - Formatting toolbar (Word-like interface):

The toolbar should be organized into logical groups, similar to Microsoft Word:

```
┌────────────────────────────────────────────────────────────────────────┐
│ File | Edit | View | Insert | Format | Table | Help                   │
├────────────────────────────────────────────────────────────────────────┤
│ Undo ↶  Redo ↷  | 🔗 | B  I  U̲  S  | @  •  123  ≡  | Σ ▼ | More ⋯  │
│ Font: [Calibri ▼] | Size: [11 ▼] | BG: [▮] | Text: [▮] | Indent: ⬅  ➡ │
└────────────────────────────────────────────────────────────────────────┘

Main toolbar sections:
1. Undo/Redo buttons
2. Basic formatting:
   - Bold (B)
   - Italic (I)
   - Underline (U with underline)
   - Strikethrough (S with line)
3. Lists & Numbering:
   - Bullet list (•)
   - Numbered list (1. 2. 3.)
   - Increase indent (→)
   - Decrease indent (←)
4. Font controls:
   - Font family dropdown (e.g., Calibri, Arial, Times New Roman)
   - Font size dropdown (8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32...)
5. Text color and highlighting:
   - Text color picker
   - Background highlight color
6. Insert menu:
   - Insert image (with upload dialog)
   - Insert table (with grid selector for rows × columns)
   - Insert link
   - Insert page break
7. Table-specific controls (appear when cursor is in table):
   - Insert row above
   - Insert row below
   - Delete row
   - Insert column left
   - Insert column right
   - Delete column
   - Merge cells
   - Split cell
   - Table properties (borders, background, etc.)
8. Additional:
   - Save button (💾)
   - Export to PDF button (⬇ PDF)
   - More options menu (...)
```

**Toolbar Implementation Details**:

```typescript
interface ToolbarState {
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
  isStrikethrough: boolean;
  fontSize: number;
  fontFamily: string;
  textColor: string;
  backgroundColor: string;
  listType: 'none' | 'bullet' | 'numbered';
  isInTable: boolean;
  canAddRow: boolean;
  canDeleteRow: boolean;
  canMergeCells: boolean;
}

// Toolbar groups
const ToolbarGroups = {
  undo: ['undo', 'redo'],
  formatting: ['bold', 'italic', 'underline', 'strikethrough'],
  fontControls: ['fontFamily', 'fontSize'],
  colors: ['textColor', 'backgroundColor'],
  lists: ['bulletList', 'numberedList', 'decreaseIndent', 'increaseIndent'],
  insert: ['insertImage', 'insertTable', 'insertLink', 'insertPageBreak'],
  tableControls: ['insertRowAbove', 'insertRowBelow', 'deleteRow', 
                  'insertColLeft', 'insertColRight', 'deleteCol'],
  actions: ['save', 'exportPDF']
};
```

### Step 3: Plugin System Implementation

#### **Text Formatting Plugin** (Built-in to Lexical)
Comprehensive text formatting support:
- **Basic Formatting**:
  - Bold text (Ctrl/Cmd + B)
  - Italic text (Ctrl/Cmd + I)
  - Underline (Ctrl/Cmd + U)
  - Strikethrough (Ctrl/Cmd + Shift + X)
  - Clear formatting (Ctrl/Cmd + M)

- **Font Controls**:
  - Font family selection (dropdown with common fonts)
  - Font size adjustment (8px to 72px)
  - Relative size adjustments (increase/decrease)

- **Text Color**:
  - Text color picker (color palette or custom color)
  - Background/highlight color (similar to marker pen in Word)

- **Paragraph Formatting**:
  - Text alignment (left, center, right, justify)
  - Line spacing (1.0, 1.5, 2.0, etc.)
  - Letter spacing

#### **Lists Plugin**
Comprehensive list support:
- **Bullet Lists**:
  - Standard bullet points
  - Different bullet styles (•, ○, ■)
  - Nested list support (indent to create sub-lists)
  - Toggle bullet list on/off

- **Numbered Lists**:
  - Automatic numbering (1, 2, 3... or a, b, c... or i, ii, iii...)
  - Different number formats
  - Nested numbering
  - Resume numbering after interruptions

- **List Controls**:
  - Increase indent (Tab or button)
  - Decrease indent (Shift+Tab or button)
  - Change list type (bullet to numbered, etc.)
  - Remove list formatting
  - Create multi-level lists
- Handle drag-and-drop image upload
- Image sizing and positioning
- Alt text support
- Integration with image upload API
- Image gallery/library selection

#### **TablePlugin.tsx**
- Insert tables with custom dimensions (specify rows × columns)
- Full table control functionality:
  - **Row Management**:
    - Insert row above selected row
    - Insert row below selected row
    - Delete row
    - Move rows up/down
  - **Column Management**:
    - Insert column to the left
    - Insert column to the right
    - Delete column
    - Move columns left/right
  - **Cell Operations**:
    - Merge cells (select multiple cells and merge)
    - Split cell (unmerge)
    - Resize cells (drag borders)
    - Set cell background color
  - **Table Header Support**:
    - Mark first row as header (bold, background color)
    - Toggle header row on/off
    - Format header cells differently from body
  - **Nested Content**:
    - Support lists, paragraphs, and formatting within cells
    - Support images in cells
  - **Table Styling**:
    - Border style and color
    - Table background color
    - Cell padding and spacing
    - Alternating row colors (striping)
  - **Responsive Design**:
    - Tables adapt to screen width
    - Scrollable on small screens
    - Proper print layout

**Context-aware Toolbar for Tables**:
When cursor is in a table, the toolbar automatically shows table-specific controls:
```
Table Toolbar (shown when cursor is in a table):
┌──────────────────────────────────────────────────┐
│ ↑ Insert Row Above | ↓ Insert Row Below | ✕ Delete Row │
│ ← Insert Column Left | → Insert Column Right | ✕ Delete Column │
│ ⊡ Merge Cells | ⊟ Split Cell | ⚙ Table Properties │
│ Header ☑ | Border Color [▮] | Cell BG [▮] │
└──────────────────────────────────────────────────┘
```

#### **LockPlugin.tsx**
- Add contentEditable={false} metadata to nodes
- Visual indicators for locked regions
- Prevent editing via keyboard/mouse
- Allow selection and copying of locked content
- Admin ability to unlock

#### **PageBreakPlugin.tsx**
- Insert page break nodes
- CSS pagination for preview
- Page numbering
- Print-friendly styling
- Page header/footer support

#### **TitlePlugin.tsx**
- Special document title node
- Larger font size
- Separate from body content
- Always appears at the top

### Step 4: Data Model & State Management

**EditorStateType** (JSON structure):
```typescript
interface EditorDocument {
  id: string;
  title: string;
  lastModified: ISO8601String;
  version: number;
  content: {
    root: {
      children: EditorNode[];
      direction: "ltr" | "rtl" | null;
      format: string;
      indent: number;
      type: "root";
    };
  };
  metadata: {
    createdAt: ISO8601String;
    author: string;
    tags: string[];
    locked?: boolean;
    lockedRegions?: string[]; // Node IDs
  };
}

interface EditorNode {
  type: "paragraph" | "heading" | "list" | "table" | "image" | "lock" | "pagebreak";
  children?: EditorNode[];
  text?: string;
  format?: number;
  locked?: boolean;
  // ... additional properties per node type
}
```

### Step 5: Import Functionality

**htmlImporter.ts** - Template Support with Locked Regions:
```typescript
export async function importHTML(htmlString: string): Promise<EditorState> {
  // Parse HTML to DOM
  const dom = new JSDOM(htmlString);
  
  // Convert DOM elements to Lexical nodes
  // Handle:
  // - Paragraphs, headings, lists
  // - Text formatting (bold, italic, etc.)
  // - Images with src extraction
  // - Tables and nested structures
  // - Links and metadata
  // - **Locked regions** (marked with data-locked attribute)
  
  // Return serialized EditorState
}

// Helper function to check if element is marked as locked
function isLockedRegion(element: Element): boolean {
  return element.hasAttribute('data-locked') || 
         element.hasAttribute('data-template-lock') ||
         element.classList.contains('locked-region');
}

// When creating nodes, apply locked metadata if source was marked
function createNodeWithLockState(element: Element, node: LexicalNode): LexicalNode {
  if (isLockedRegion(element)) {
    // Add locked metadata to node
    node.__locked = true;
    node.__lockReason = element.getAttribute('data-lock-reason') || 'Template locked region';
  }
  return node;
}
```

**Template HTML with Locked Regions** - Example formats:

**Option 1: Using data-locked attribute (Recommended)**
```html
<!DOCTYPE html>
<html>
<head>
  <title>Document Template</title>
</head>
<body>
  <!-- Header section - locked -->
  <div data-locked="true" data-lock-reason="Company Header">
    <h1>Bidrag Treatment Document</h1>
    <p>Case Number: 2024-12345</p>
  </div>

  <!-- Editable section -->
  <h2>Case Details</h2>
  <p>Please fill in the case information below:</p>

  <!-- Locked template section -->
  <table data-locked="true" data-lock-reason="Template Structure">
    <tr>
      <td><strong>Field:</strong></td>
      <td>Applicant Name</td>
    </tr>
    <tr>
      <td><strong>Case Type:</strong></td>
      <td><!-- User editable cell, but table structure locked --></td>
    </tr>
  </table>

  <!-- Footer - locked -->
  <footer data-locked="true" data-lock-reason="Document Footer">
    <p>© 2026 NAV. All rights reserved.</p>
  </footer>
</body>
</html>
```

**Option 2: Using custom CSS class**
```html
<div class="locked-region" data-lock-reason="Template Header">
  <h1>Company Letterhead</h1>
</div>

<p>Editable content here...</p>

<div class="locked-region" data-lock-reason="Terms and Conditions">
  <p>These terms cannot be modified...</p>
</div>
```

**Option 3: Using data-template-lock attribute**
```html
<div data-template-lock="true" data-locked-by-admin="true">
  <p>This section is locked by administrator</p>
</div>
```

**Processing Locked Regions During Import**:

The HTML importer should:

1. **Detect locked markers**:
   - Look for `data-locked="true"`, `data-template-lock`, or `.locked-region` class
   - Read optional `data-lock-reason` for admin notes

2. **Create Locked Nodes**:
   ```typescript
   // Create a special Lexical node type for locked regions
   export class LockedRegionNode extends ElementNode {
     __locked: boolean;
     __lockReason: string;
     __lockedBy: string; // "template" | "user" | "admin"
     
     static getType(): string {
       return 'locked-region';
     }
     
     static clone(node: LockedRegionNode): LockedRegionNode {
       return new LockedRegionNode(
         node.__locked,
         node.__lockReason,
         node.__lockedBy,
         node.__key
       );
     }
     
     createDOM(): HTMLElement {
       const el = document.createElement('div');
       el.className = 'locked-region';
       el.style.backgroundColor = '#f0f0f0';
       el.style.border = '1px solid #ccc';
       el.style.padding = '8px';
       el.style.borderRadius = '4px';
       el.contentEditable = 'false';
       el.title = this.__lockReason;
       return el;
     }
   }
   ```

3. **Preserve Content Structure**:
   - Keep the HTML content intact inside locked regions
   - Apply locked state recursively to all child nodes
   - Prevent editing but allow selection and copying

4. **Visual Indicators**:
   - Gray background or border pattern for locked regions
   - Lock icon (🔒) indicator
   - Tooltip showing lock reason on hover
   - Prevent text selection inside locked areas (or allow but prevent editing)

**Styling Locked Regions in Editor**:

```css
/* Locked region styling */
.locked-region {
  background-color: #f5f5f5;
  border: 1px solid #d0d0d0;
  border-radius: 4px;
  padding: 8px;
  margin: 4px 0;
  position: relative;
  pointer-events: none; /* Prevent selection */
}

.locked-region::before {
  content: '🔒 Locked Section';
  display: block;
  font-size: 12px;
  color: #666;
  margin-bottom: 8px;
}

/* Allow content selection but not editing */
.locked-region {
  user-select: text;
  cursor: not-allowed;
}

/* Hover effect to show lock reason */
.locked-region:hover::after {
  content: attr(data-lock-reason);
  position: absolute;
  background: #333;
  color: white;
  padding: 4px 8px;
  border-radius: 2px;
  font-size: 11px;
  white-space: nowrap;
  z-index: 1000;
}
```

**Example Workflow**:

```typescript
// User provides template.html
const templateHTML = `
  <div data-locked="true" data-lock-reason="Official Header">
    <h1>Contract Form</h1>
    <p>Date: [Auto-filled]</p>
  </div>
  <div>
    <p>Please enter your details:</p>
    <input type="text" placeholder="Your Name" />
  </div>
`;

// Editor imports and processes
const editorState = await importHTML(templateHTML);

// Result:
// ✅ Locked header preserved, users cannot edit it
// ✅ Editable sections remain fully editable
// ✅ Visual indicators show which sections are locked
// ✅ Lock metadata stored in Lexical nodes for backend persistence
```

**rtfImporter.ts**:
```typescript
export async function importRTF(rtfFile: File): Promise<EditorState> {
  // Use mammoth to convert RTF/DOCX to HTML
  const html = await mammoth.convertToHtml({ arrayBuffer: rtfFile });
  
  // Pass through HTML importer
  return importHTML(html.value);
}
```

### Step 6: Save/Load Functionality

**documentApi.ts**:
```typescript
// Backend API integration
export async function saveDocument(doc: EditorDocument): Promise<void> {
  // POST /api/documents/save
  // Save as JSON file on backend
  // Store in database with versioning
}

export async function loadDocument(documentId: string): Promise<EditorDocument> {
  // GET /api/documents/{documentId}
  // Load from backend
}

export async function listDocuments(): Promise<EditorDocument[]> {
  // GET /api/documents
  // List all user documents
}
```

**Auto-save mechanism**:
- Debounced save on content change (e.g., 5-second delay)
- Save indicator UI
- Conflict resolution for concurrent edits
- Restore from drafts on page reload

### Step 7: PDF Export

**pdfExporter.ts**:
```typescript
export async function exportToPDF(
  editorState: EditorState,
  title: string
): Promise<Blob> {
  // Client-side approach:
  // 1. Render editor content to canvas using html2canvas
  // 2. Create PDF with jsPDF
  // 3. Add images, maintain formatting
  
  // For more control (server-side):
  // 1. Send editor state to backend
  // 2. Use Puppeteer to render and convert
  // 3. Return PDF binary
}
```

**Implementation details**:
- Preserve page breaks
- Add headers and footers (page number, date, etc.)
- Maintain locked region indicators or hide them
- Scale content to fit A4 page
- Handle images and tables properly
- Support landscape/portrait orientation

### Step 8: User Interface Design

**Editor Layout - Modern, CKEditor-style Interface**:
```
┌──────────────────────────────────────────────────────────────────────┐
│                                                                      │
│  ┌─ TOOLBAR (Sticky, floating at top) ─────────────────────────────┐ │
│  │                                                                  │ │
│  │  [↶] [↷]  |  [B] [I] [U]  |  [≡] [•] [1.]  |  [Ⓣ▼] [#▼] [◼▼] │ │
│  │  [Link] [Image] [Table] [More ⋯]  |  [💾] [⬇PDF]  | [⋮⋮⋮]      │ │
│  │                                                                  │ │
│  └──────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌─ DOCUMENT EDITOR ──────────────────────────────────────────────┐ │
│  │                                                                │ │
│  │  ╔════════════════════════════════════════════════════════╗  │ │
│  │  ║                                                        ║  │ │
│  │  ║  Document Title (Editable)                            ║  │ │
│  │  ║                                                        ║  │ │
│  │  ║  Start typing your document here...                  ║  │ │
│  │  ║                                                        ║  │ │
│  │  ║  • Bullet point                                       ║  │ │
│  │  ║  • Another bullet                                     ║  │ │
│  │  ║                                                        ║  │ │
│  │  ╚════════════════════════════════════════════════════════╝  │ │
│  │                                                                │ │
│  │  Page 1 of 2 | Word Count: 42 | Last Saved: Now            │ │
│  │                                                                │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

**Modern Toolbar Design** (CKEditor-style):

```
Primary Toolbar:
┌────────────────────────────────────────────────────────────────┐
│ [↶]  [↷] │ [B]  [I]  [U]  [S] │ [≡]  [•]  [1.] │ [Ⓣ▼] │ [◼▼] │
└────────────────────────────────────────────────────────────────┘

Secondary/Context Toolbar (appears when cursor in table, selection active, etc):
┌────────────────────────────────────────────────────────────────┐
│ [Link]  [Image]  [Table]  [More ⋯] │ [💾]  [⬇PDF]  | [⋮⋮⋮]     │
└────────────────────────────────────────────────────────────────┘

Collapsed "More" Menu:
┌────────────────────────────┐
│ ▼ Formatting               │
│  ├─ Strikethrough          │
│  ├─ Subscript              │
│  ├─ Superscript            │
│  ├─ Code                   │
│  └─ Clear Formatting       │
│                            │
│ ▼ Paragraph Style          │
│  ├─ Normal                 │
│  ├─ Heading 1              │
│  ├─ Heading 2              │
│  ├─ Heading 3              │
│  └─ Quote                  │
│                            │
│ ▼ Insert                   │
│  ├─ Page Break             │
│  ├─ Horizontal Rule        │
│  └─ Special Character      │
│                            │
│ ▼ Alignment                │
│  ├─ Left Align             │
│  ├─ Center Align           │
│  ├─ Right Align            │
│  └─ Justify                │
└────────────────────────────┘

Font & Size Dropdowns:
┌──────────────────┐  ┌─────────────┐
│ Font: Arial ▼    │  │ Size: 12 ▼  │
├──────────────────┤  ├─────────────┤
│ Arial            │  │ 8           │
│ Calibri          │  │ 10          │
│ Georgia          │  │ 12          │
│ Times New Roman  │  │ 14          │
│ Courier New      │  │ 16          │
│ Verdana          │  │ 18          │
└──────────────────┘  │ 20          │
                      │ 24          │
                      │ 28          │
                      │ 32          │
                      └─────────────┘

Color Picker (Text & Background):
┌────────────────────────────────┐
│ Text Color: [▮] ▼              │
├────────────────────────────────┤
│ Recent:  [■] [■] [■]           │
│                                │
│ Palette:                        │
│ [■] [■] [■] [■] [■] [■] [■]   │
│ [■] [■] [■] [■] [■] [■] [■]   │
│                                │
│ [Custom Color...] [Default]    │
└────────────────────────────────┘
```

**Toolbar Features - Modern Approach**:
- **Icon-based buttons**: Clear, recognizable icons with tooltips on hover
- **Smart grouping**: Related tools grouped with dividers
- **Dropdowns**: Font family, size, colors, paragraph styles grouped in dropdowns
- **Floating position**: Sticky at top but doesn't take up unnecessary space
- **Responsive**: On mobile, shows only essential tools, hides others in "More" menu
- **Context-aware**: Table tools appear only when cursor is in a table
- **Keyboard shortcuts**: All buttons show keyboard shortcut on tooltip hover
- **Visual feedback**: Active buttons highlighted, disabled buttons grayed out
- **Search/filter**: In dropdowns, users can type to search (e.g., search fonts)

**Detailed Toolbar Organization**:

```typescript
// Modern toolbar structure
const ToolbarConfig = {
  // Row 1: Essential formatting
  row1: [
    { id: 'undo', icon: '↶', tooltip: 'Undo (Ctrl+Z)' },
    { id: 'redo', icon: '↷', tooltip: 'Redo (Ctrl+Y)' },
    { separator: true },
    { id: 'bold', icon: 'B', tooltip: 'Bold (Ctrl+B)', toggle: true },
    { id: 'italic', icon: 'I', tooltip: 'Italic (Ctrl+I)', toggle: true },
    { id: 'underline', icon: 'U', tooltip: 'Underline (Ctrl+U)', toggle: true },
    { id: 'strikethrough', icon: 'S', tooltip: 'Strikethrough (Ctrl+Shift+X)', toggle: true },
    { separator: true },
    { id: 'blockquote', icon: '❝', tooltip: 'Quote (Ctrl+Shift+B)' },
    { id: 'bulletList', icon: '•', tooltip: 'Bullet List', toggle: true },
    { id: 'orderedList', icon: '1.', tooltip: 'Numbered List', toggle: true },
    { separator: true },
    { id: 'fontSize', type: 'dropdown', icon: '◼', options: [8, 10, 12, 14, 16, 18, 20, 24, 28, 32] },
    { separator: true },
    { id: 'textColor', type: 'colorPicker', icon: '🎨', tooltip: 'Text Color' },
  ],
  
  // Row 2: Insert & Advanced
  row2: [
    { id: 'link', icon: '🔗', tooltip: 'Link (Ctrl+K)' },
    { id: 'image', icon: '🖼', tooltip: 'Image (Ctrl+Shift+I)' },
    { id: 'table', icon: '⊞', tooltip: 'Table' },
    { id: 'more', icon: '⋯', dropdown: true, tooltip: 'More Options' },
    { separator: true },
    { id: 'save', icon: '💾', tooltip: 'Save (Ctrl+S)', primary: true },
    { id: 'exportPDF', icon: '📄', tooltip: 'Export to PDF' },
    { id: 'menu', icon: '⋮⋮⋮', dropdown: true, tooltip: 'Document Menu' },
  ]
};
```

**Table-Context Toolbar** (appears when cursor is in a table):
```
┌─────────────────────────────────────────────────────────────┐
│ [↑ Insert Row Above] [↓ Insert Row Below] [✕ Delete Row] │
│ [← Insert Col] [→ Insert Col] [✕ Delete Col]  |  [More ⋯]  │
└─────────────────────────────────────────────────────────────┘
```

**Dropdown "More" Menu**:
```
┌─────────────────────────────────┐
│ Text Effects                    │
│  ├─ Superscript                 │
│  ├─ Subscript                   │
│  ├─ Code (inline)               │
│  └─ Clear Formatting            │
│                                 │
│ Paragraph                       │
│  ├─ Paragraph Style ▶           │
│  ├─ Alignment ▶                 │
│  ├─ Line Height ▶               │
│  └─ Indentation ▶               │
│                                 │
│ Insert                          │
│  ├─ Page Break                  │
│  ├─ Horizontal Line             │
│  ├─ Special Character           │
│  ├─ Comment/Note                │
│  └─ Footnote                    │
│                                 │
│ Document                        │
│  ├─ Lock Section                │
│  ├─ Find & Replace              │
│  └─ Document Properties         │
└─────────────────────────────────┘
```

**Keyboard Shortcuts Display**:

Most important shortcuts shown in tooltips:
```
Ctrl+B          Bold
Ctrl+I          Italic
Ctrl+U          Underline
Ctrl+K          Link
Ctrl+Z          Undo
Ctrl+Y          Redo
Ctrl+S          Save
Tab             Increase Indent
Shift+Tab       Decrease Indent
Enter           New Paragraph
Ctrl+Enter      Page Break
```

### Step 9: Advanced Features

#### Copy/Paste
- Leverage Lexical's built-in clipboard handling
- Custom paste handlers for HTML content
- Paste special (unformatted text option)

#### Locking Regions
- UI to select and lock content
- Visual styling (background color, border)
- Prevent editing via custom node handlers
- Allow admin/owner to unlock

#### Page Management
- Visual page separators in editor
- "Add Page" button
- Delete page functionality
- Page navigation shortcuts
- Print preview with proper pagination

#### Real-time Collaboration (Optional Phase 2)
- WebSocket support for live updates
- Cursor presence indicators
- Conflict resolution with Operational Transformation

### Step 10: Error Handling & Validation

**Error scenarios to handle**:
- Failed image uploads (show error toast)
- Network errors during save (retry mechanism)
- Invalid HTML imports (fallback to text)
- Large file uploads (size limits)
- Concurrent edits (merge strategy)
- PDF export failures (download as JSON fallback)

**Implementation**:
- Try-catch blocks with user feedback
- Retry logic with exponential backoff
- Validation schemas for imported content
- Size limits enforcement
- Error logging and reporting

---

## 4. Implementation Timeline

### Phase 1: Core Editor (Week 1-2)
- [ ] Setup Lexical with React integration
- [ ] Basic formatting toolbar
- [ ] Text editing and undo/redo
- [ ] Save/load from backend (JSON)
- [ ] Auto-save functionality

### Phase 2: Advanced Features (Week 3-4)
- [ ] Image insertion and management
- [ ] Table support
- [ ] Page breaks and pagination
- [ ] Lock regions functionality
- [ ] HTML import

### Phase 3: Export & Polish (Week 5)
- [ ] PDF export functionality
- [ ] RTF/DOCX import support
- [ ] UI/UX refinement
- [ ] Performance optimization
- [ ] Testing

### Phase 4: Integration & Deployment (Week 6)
- [ ] Integration with existing application
- [ ] Add editor route to app.tsx
- [ ] Backend API finalization
- [ ] Security and permissions
- [ ] Production deployment

---

## 10. Routing & Integration

### Route Configuration

The editor component should be added to `app.tsx` with the following route structure:

**Route Path**: `/rediger/editor/:journalpostId/:dokumentReferanse`

**Route Configuration** (in app.tsx):
```typescript
import { DokumentRedigeringPage } from './pages/dokumentredigering/DokumentRedigeringPage';

// Add to your router configuration
const routes = [
  // ... existing routes
  {
    path: '/rediger/editor/:journalpostId/:dokumentReferanse',
    element: <DokumentRedigeringPage />,
    name: 'Document Editor',
    requiresAuth: true,
    requiredPermissions: ['edit_document'],
  },
  // ... other routes
];
```

**URL Parameters**:
- `journalpostId`: The journal entry ID (case/document reference number)
- `dokumentReferanse`: The document reference ID (unique identifier for the specific document)

**Example URLs**:
```
/rediger/editor/2024-12345/DOC-001
/rediger/editor/2024-67890/DOC-002
```

**DokumentRedigeringPage Component** (updated):
```typescript
import { useParams } from 'react-router-dom';
import { Editor } from '@/components/editor/Editor';

export function DokumentRedigeringPage() {
  const { journalpostId, dokumentReferanse } = useParams<{
    journalpostId: string;
    dokumentReferanse: string;
  }>();

  return (
    <div className="dokument-redigering-page">
      <Editor 
        journalpostId={journalpostId!}
        dokumentReferanse={dokumentReferanse!}
      />
    </div>
  );
}
```

**Editor Component Props**:
```typescript
interface EditorProps {
  journalpostId: string;
  dokumentReferanse: string;
  documentId?: string;
  initialContent?: EditorStateType;
  onSave: (state: EditorStateType) => Promise<void>;
  readonly?: boolean;
}

// The editor will use journalpostId and dokumentReferanse to:
// 1. Load the document from backend (/api/documents/{journalpostId}/{dokumentReferanse})
// 2. Save changes to backend
// 3. Track document history and versions
// 4. Load templates if it's a new document
```

**Navigation to Editor**:

Users can navigate to the editor from other pages using:
```typescript
import { useNavigate } from 'react-router-dom';

function DocumentListPage() {
  const navigate = useNavigate();

  const editDocument = (journalpostId: string, dokumentReferanse: string) => {
    navigate(`/rediger/editor/${journalpostId}/${dokumentReferanse}`);
  };

  return (
    <button onClick={() => editDocument('2024-12345', 'DOC-001')}>
      Edit Document
    </button>
  );
}
```

**Backend API Integration**:

The editor will communicate with these endpoints:
```typescript
// Load document
GET /api/documents/{journalpostId}/{dokumentReferanse}

// Save document
POST /api/documents/{journalpostId}/{dokumentReferanse}/save

// Export to PDF
POST /api/documents/{journalpostId}/{dokumentReferanse}/export-pdf

// Load template
GET /api/templates/{templateId}

// Upload images
POST /api/documents/upload-image

// List document versions
GET /api/documents/{journalpostId}/{dokumentReferanse}/versions

// Revert to previous version
POST /api/documents/{journalpostId}/{dokumentReferanse}/revert/{versionId}
```

**Authentication & Permissions**:

The route should be protected with:
```typescript
// Check if user has permission to edit this document
const canEditDocument = (journalpostId: string) => {
  return userHasPermission(`edit_document_${journalpostId}`);
};

// Only allow access to documents belonging to current user or case assignment
const isDocumentAccessible = (journalpostId: string) => {
  return currentUserCases.includes(journalpostId);
};
```

**Navigation Breadcrumbs**:

Show navigation context to user:
```
Home > Cases > [Case 2024-12345] > Documents > [Edit Document]
```

---

## 5. Performance Considerations

- **Large documents**: Lexical handles 10k+ nodes efficiently
- **Image optimization**: Compress images on upload, lazy load in editor
- **State serialization**: Efficient JSON serialization for backend
- **Debounced saves**: Prevent excessive API calls
- **Virtual scrolling**: For very long documents (if needed with Lexical plugins)
- **Code splitting**: Lazy load editor components

---

## 6. Security Considerations

- **XSS Prevention**: Sanitize imported HTML content
- **File upload validation**: Check file types, size, and content
- **API authentication**: Ensure only authorized users can save/load
- **Backend validation**: Validate all data from frontend
- **Locked regions**: Server-side enforcement, not just client-side
- **Data encryption**: Consider encrypting sensitive documents

---

## 7. Testing Strategy

### Unit Tests
- HTML/RTF import converters
- State serialization/deserialization
- PDF export generation

### Integration Tests
- Save/load workflow
- Plugin interactions
- Editor state consistency

### E2E Tests
- Create document → Edit → Save → Load → Export flow
- Image upload and handling
- Table creation and manipulation
- Lock/unlock regions

---

## 8. Browser Compatibility

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- IE: Not supported (use graceful degradation)
- Mobile: Responsive design, touch-friendly toolbar

---

## 9. Accessibility

- Keyboard navigation throughout editor
- Screen reader support for toolbar
- ARIA labels on all interactive elements
- High contrast mode support
- Focus management

# Implementation Plan

## 1. Choose the Base Library
- Evaluate Lexical, QuillJS, and DraftJS based on community size, maintenance, extensibility, and support for required features.
- Select the most suitable one (likely Lexical for modern React integration and extensibility).

## 2. Set Up the Project Structure
- Create a new React component for the editor within the bidrag-dokument-redigering-ui project.
- Organize the code into modules: editor core, plugins for features, utilities for conversion and export.

## 3. Implement Core Editor Features
- Integrate the chosen library into a React component.
- Add basic WYSIWYG functionality (text formatting, lists, etc.).
- Implement title addition as a special header element.

## 4. Add Advanced Features
- Copy/paste: Leverage browser APIs and library plugins.
- Image insertion: Create a plugin for uploading and embedding images.
- Table support: Use library plugins or custom implementation.
- Page breaks: Implement as special elements or CSS-based page separation.
- Locking areas: Add metadata to content nodes to mark them as read-only.

## 5. Data Persistence
- Implement saving functionality to store editor state as JSON.
- Create backend API endpoints for saving/loading JSON files.
- Add versioning to track changes over time.

## 6. Import Functionality
- Develop converters for HTML to editor format.
- Implement RTF to HTML conversion (using libraries like mammoth.js).
- Allow users to upload and import files on first edit.

## 7. Export to PDF
- Use libraries like jsPDF or Puppeteer to convert the editor content to PDF.
- Ensure proper styling and layout preservation during export.

## 8. User Interface and UX
- Design the editor UI with toolbar, menus, and property panels.
- Add save/load dialogs and export options.
- Implement undo/redo functionality.

## 9. Testing and Validation
- Write unit tests for components and utilities.
- Test conversion accuracy for HTML/RTF imports.
- Validate PDF export quality.

## 10. Deployment and Integration
- Integrate the editor into the existing bidrag-dokument-redigering-ui application.
- Ensure compatibility with the current tech stack and build process.