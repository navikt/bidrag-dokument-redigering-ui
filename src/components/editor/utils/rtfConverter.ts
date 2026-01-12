/**
 * RTF to HTML Converter Utility
 *
 * Converts RTF (Rich Text Format) content to HTML for use in the Lexical editor.
 * Supports text formatting, tables, and embedded images.
 *
 * Based on Nav bidrag document format (testdata1.rtf):
 * - Images embedded in \shp groups with \shppict\pict
 * - Norwegian special characters (å, æ, ø, Å, Æ, Ø)
 * - Non-breaking spaces for number formatting (e.g., 8~050)
 * - Tables with borders and background colors
 */

interface RTFParserState {
    bold: boolean;
    italic: boolean;
    underline: boolean;
    strikethrough: boolean;
    fontSize: number;
    fontFamily: string;
    color: string;
    colorIndex: number;
    backgroundColor: string;
    inPicture: boolean;
    pictureType: string;
    pictureData: string;
    pictureWidth: number;
    pictureHeight: number;
    inTable: boolean;
    skipContent: boolean;
    alignment: "left" | "center" | "right" | "justify";
}

interface ExtractedImage {
    type: string;
    data: string;
    width: number;
    height: number;
    placeholder: string;
}

interface ColorTable {
    [index: number]: string;
}

/**
 * Converts RTF content string to HTML
 */
export function convertRTFToHTML(rtfContent: string): string {
    if (!rtfContent || typeof rtfContent !== "string") {
        return "";
    }

    const cleanedRtf = rtfContent.trim();

    if (!cleanedRtf.startsWith("{\\rtf")) {
        return `<p>${escapeHtml(cleanedRtf)}</p>`;
    }

    try {
        // Extract color table for styling
        const colorTable = extractColorTable(cleanedRtf);

        // First pass: extract all images and replace with placeholders
        const { rtfWithPlaceholders, images } = extractImages(cleanedRtf);

        // Second pass: parse the RTF content
        let html = parseRTF(rtfWithPlaceholders, colorTable);

        // Third pass: replace placeholders with actual images
        for (const img of images) {
            const imgTag = createImageTagFromExtracted(img);
            html = html.replace(img.placeholder, imgTag);
        }

        return html;
    } catch (error) {
        console.error("Error parsing RTF:", error);
        return `<p>${extractPlainTextFromRTF(cleanedRtf)}</p>`;
    }
}

/**
 * Extract color table from RTF
 */
function extractColorTable(rtf: string): ColorTable {
    const colorTable: ColorTable = { 0: "#000000" }; // Default black
    const colorTableMatch = rtf.match(/\{\\colortbl;([^}]+)\}/);

    if (colorTableMatch) {
        const colorDefs = colorTableMatch[1].split(";");
        colorDefs.forEach((colorDef, index) => {
            const r = colorDef.match(/\\red(\d+)/);
            const g = colorDef.match(/\\green(\d+)/);
            const b = colorDef.match(/\\blue(\d+)/);

            if (r && g && b) {
                const red = parseInt(r[1], 10);
                const green = parseInt(g[1], 10);
                const blue = parseInt(b[1], 10);
                colorTable[index + 1] = `rgb(${red}, ${green}, ${blue})`;
            }
        });
    }

    return colorTable;
}

/**
 * Extract all images from RTF and replace with placeholders
 * Handles both direct \pict groups and images nested in \shp shapes
 * Uses an iterative approach to avoid regex backtracking issues in Chrome
 */
function extractImages(rtf: string): { rtfWithPlaceholders: string; images: ExtractedImage[] } {
    const images: ExtractedImage[] = [];
    let result = rtf;
    let imageIndex = 0;

    // Helper function to find matching closing brace
    function findMatchingBrace(str: string, startIndex: number): number {
        let depth = 1;
        let i = startIndex;
        const maxIterations = 100000; // Prevent infinite loops
        let iterations = 0;

        while (i < str.length && depth > 0 && iterations < maxIterations) {
            if (str[i] === "{") depth++;
            else if (str[i] === "}") depth--;
            i++;
            iterations++;
        }

        return depth === 0 ? i : -1;
    }

    // Extract \shp groups iteratively (common in Nav documents)
    let searchStart = 0;
    const maxShpIterations = 1000; // Limit number of shapes to process
    let shpIterations = 0;

    while (searchStart < result.length && shpIterations < maxShpIterations) {
        const shpIndex = result.indexOf("{\\shp", searchStart);
        if (shpIndex === -1) break;

        const endIndex = findMatchingBrace(result, shpIndex + 1);
        if (endIndex === -1) {
            searchStart = shpIndex + 5;
            continue;
        }

        const shpContent = result.substring(shpIndex, endIndex);

        // Look for \pict inside the shape
        const pictIndex = shpContent.indexOf("\\pict");
        if (pictIndex !== -1) {
            // Find the pict group boundaries
            const pictStart = shpContent.lastIndexOf("{", pictIndex);
            if (pictStart !== -1) {
                const pictEnd = findMatchingBrace(shpContent, pictStart + 1);
                if (pictEnd !== -1) {
                    const pictContent = shpContent.substring(pictStart, pictEnd);
                    const img = parsePictGroup(pictContent);
                    if (img && img.data.length > 100) {
                        const placeholder = `__IMG_PLACEHOLDER_${imageIndex}__`;
                        images.push({ ...img, placeholder });
                        imageIndex++;
                        result = result.substring(0, shpIndex) + placeholder + result.substring(endIndex);
                        searchStart = shpIndex + placeholder.length;
                        shpIterations++;
                        continue;
                    }
                }
            }
        }

        // Remove shape if no valid image
        result = result.substring(0, shpIndex) + result.substring(endIndex);
        shpIterations++;
    }

    // Extract \shppict groups iteratively
    searchStart = 0;
    let shppictIterations = 0;

    while (searchStart < result.length && shppictIterations < maxShpIterations) {
        const shppictIndex = result.indexOf("{\\*\\shppict", searchStart);
        if (shppictIndex === -1) break;

        const endIndex = findMatchingBrace(result, shppictIndex + 1);
        if (endIndex === -1) {
            searchStart = shppictIndex + 11;
            continue;
        }

        const shppictContent = result.substring(shppictIndex, endIndex);
        const img = parsePictGroup(shppictContent);

        if (img && img.data.length > 100) {
            const placeholder = `__IMG_PLACEHOLDER_${imageIndex}__`;
            images.push({ ...img, placeholder });
            imageIndex++;
            result = result.substring(0, shppictIndex) + placeholder + result.substring(endIndex);
            searchStart = shppictIndex + placeholder.length;
        } else {
            result = result.substring(0, shppictIndex) + result.substring(endIndex);
        }
        shppictIterations++;
    }

    // Extract direct \pict groups iteratively
    searchStart = 0;
    let pictIterations = 0;

    while (searchStart < result.length && pictIterations < maxShpIterations) {
        const pictIndex = result.indexOf("{\\pict", searchStart);
        if (pictIndex === -1) break;

        const endIndex = findMatchingBrace(result, pictIndex + 1);
        if (endIndex === -1) {
            searchStart = pictIndex + 6;
            continue;
        }

        const pictContent = result.substring(pictIndex, endIndex);
        const img = parsePictGroup(pictContent);

        if (img && img.data.length > 100) {
            const placeholder = `__IMG_PLACEHOLDER_${imageIndex}__`;
            images.push({ ...img, placeholder });
            imageIndex++;
            result = result.substring(0, pictIndex) + placeholder + result.substring(endIndex);
            searchStart = pictIndex + placeholder.length;
        } else {
            searchStart = endIndex;
        }
        pictIterations++;
    }

    return { rtfWithPlaceholders: result, images };
}

/**
 * Parse a \pict group to extract image data
 */
function parsePictGroup(pictGroup: string): ExtractedImage | null {
    let type = "png";
    let width = 0;
    let height = 0;

    // Determine image type
    if (pictGroup.includes("\\pngblip")) type = "png";
    else if (pictGroup.includes("\\jpegblip")) type = "jpeg";
    else if (pictGroup.includes("\\emfblip")) type = "emf";
    else if (pictGroup.includes("\\wmetafile")) type = "wmf";

    // Extract dimensions
    const widthMatch = pictGroup.match(/\\picwgoal(\d+)/);
    const heightMatch = pictGroup.match(/\\pichgoal(\d+)/);
    if (widthMatch) width = parseInt(widthMatch[1], 10);
    if (heightMatch) height = parseInt(heightMatch[1], 10);

    // Extract hex data (last part of the group, after all control words)
    const hexMatch = pictGroup.match(/\}?\s*([0-9a-fA-F\s]{50,})\s*\}?\s*$/);
    if (!hexMatch) return null;

    const hexData = hexMatch[1].replace(/\s/g, "");
    if (hexData.length < 100) return null;

    return { type, data: hexData, width, height, placeholder: "" };
}

/**
 * Create an img tag from extracted image data
 */
function createImageTagFromExtracted(img: ExtractedImage): string {
    const mimeType = getMimeType(img.type);
    const base64Data = hexToBase64(img.data);

    if (!base64Data) return "";

    const widthStyle = img.width > 0 ? `width: ${Math.round(img.width / 20)}px;` : "";
    const heightStyle = img.height > 0 ? `height: ${Math.round(img.height / 20)}px;` : "";
    const style = `max-width: 100%; height: auto; ${widthStyle} ${heightStyle}`.trim();

    return `<img src="data:${mimeType};base64,${base64Data}" style="${style}" alt="Embedded image" />`;
}

/**
 * Main RTF parser function
 */
function parseRTF(rtf: string, colorTable: ColorTable = { 0: "#000000" }): string {
    const html: string[] = [];
    let currentState: RTFParserState = createInitialState();
    const stateStack: RTFParserState[] = [];

    let i = 0;
    let textBuffer = "";
    let skipDepth = 0;

    // Table tracking
    let tableRows: { content: string; alignment: string; width?: number }[][] = [];
    let currentRowCells: { content: string; alignment: string; width?: number }[] = [];
    let currentCellContent: string[] = [];
    let currentCellAlignment = "left";
    let currentCellWidths: number[] = []; // Store cellx values for current row
    let inTable = false;
    let inRow = false;
    let inCell = false;
    let lastRowEndIndex = -1; // Track where the last row ended to detect table continuity

    const flushTextBuffer = () => {
        if (textBuffer.length > 0) {
            // Clean out any remaining hex data or shape metadata
            const cleanedText = textBuffer
                .replace(/[0-9A-Fa-f]{20,}/g, "")
                .replace(
                    /\b(shapeType|fFlipH|fFlipV|fFilled|fLine|lTxid|dxText|dyText|pibFlags|pib|picscale|piccrop|bliptag|blipuid)\d*/gi,
                    ""
                )
                .replace(/\s{2,}/g, " ");

            // Don't trim - preserve leading/trailing spaces for proper text joining
            // Only skip if the text is completely empty after cleaning hex data
            if (cleanedText.length > 0) {
                const formatted = applyFormattingToText(cleanedText, currentState);
                if (inCell) {
                    currentCellContent.push(formatted);
                } else {
                    html.push(formatted);
                }
            }
            textBuffer = "";
        }
    };

    const openCell = () => {
        if (!inCell) {
            flushTextBuffer();
            inCell = true;
            currentCellContent = [];
            currentCellAlignment = currentState.alignment;
        }
    };

    const closeCell = () => {
        if (inCell) {
            flushTextBuffer();
            const cellContent = currentCellContent.join("").trim() || "&nbsp;";
            // Calculate width from cellx values (difference between current and previous cellx)
            const cellIndex = currentRowCells.length;
            let cellWidth: number | undefined;
            if (currentCellWidths.length > cellIndex) {
                const currentCellX = currentCellWidths[cellIndex];
                const previousCellX = cellIndex > 0 ? currentCellWidths[cellIndex - 1] : 0;
                cellWidth = currentCellX - previousCellX;
            }
            currentRowCells.push({ content: cellContent, alignment: currentCellAlignment, width: cellWidth });
            currentCellContent = [];
            inCell = false;
            currentCellAlignment = "left";
        }
    };

    const closeRow = () => {
        closeCell();
        if (currentRowCells.length > 0) {
            tableRows.push([...currentRowCells]);
            currentRowCells = [];
        }
        currentCellWidths = []; // Reset cell widths for next row
        inRow = false;
    };

    const closeTable = () => {
        closeRow();
        if (tableRows.length > 0) {
            // Calculate total width from the first row to determine percentages
            const firstRow = tableRows[0];
            const totalWidth = firstRow.reduce((sum, cell) => sum + (cell.width || 0), 0);

            let tableHtml =
                '<table style="border-collapse: collapse; width: 100%; margin: 16px 0; border: 1px solid #ccc;"><tbody>';
            for (const row of tableRows) {
                tableHtml += "<tr>";
                for (const cell of row) {
                    const styles: string[] = ["border: 1px solid #ccc", "padding: 8px 12px"];

                    // Calculate width percentage if we have width data
                    if (cell.width && totalWidth > 0) {
                        const widthPercent = Math.round((cell.width / totalWidth) * 100);
                        styles.push(`width: ${widthPercent}%`);
                    }

                    if (cell.alignment !== "left") {
                        styles.push(`text-align: ${cell.alignment}`);
                    }

                    tableHtml += `<td style="${styles.join("; ")};">${cell.content}</td>`;
                }
                tableHtml += "</tr>";
            }
            tableHtml += "</tbody></table>";
            html.push(tableHtml);
            tableRows = [];
        }
        inTable = false;
    };

    const addParagraphBreak = () => {
        flushTextBuffer();
        if (inCell) {
            currentCellContent.push("<br/>");
        } else {
            html.push("</p><p>");
        }
    };

    // Check for image placeholder
    const checkImagePlaceholder = () => {
        const placeholderMatch = textBuffer.match(/__IMG_PLACEHOLDER_(\d+)__/);
        if (placeholderMatch) {
            // Split buffer at placeholder
            const parts = textBuffer.split(placeholderMatch[0]);
            textBuffer = parts[0];
            flushTextBuffer();

            // Add the placeholder (will be replaced later)
            if (inCell) {
                currentCellContent.push(placeholderMatch[0]);
            } else {
                html.push(placeholderMatch[0]);
            }

            textBuffer = parts.slice(1).join(placeholderMatch[0]);
        }
    };

    html.push("<p>");

    while (i < rtf.length) {
        const char = rtf[i];

        // Handle skip mode for groups we want to ignore
        if (skipDepth > 0) {
            if (char === "{") skipDepth++;
            else if (char === "}") skipDepth--;
            i++;
            continue;
        }

        if (char === "{") {
            stateStack.push({ ...currentState });
            i++;
        } else if (char === "}") {
            if (stateStack.length > 0) {
                currentState = stateStack.pop()!;
            }
            i++;
        } else if (char === "\\") {
            const result = parseControlWord(rtf, i);
            i = result.newIndex;

            // Check for optional destination marker
            if (result.word === "*") {
                // Next control word is optional - check if we should skip
                const nextResult = parseControlWord(rtf, i);
                if (["shppict", "picprop", "blipuid", "sp", "sn", "sv"].includes(nextResult.word)) {
                    // Skip this group
                    skipDepth = 1;
                    i = nextResult.newIndex;
                    continue;
                }
            }

            switch (result.word) {
                case "par":
                    addParagraphBreak();
                    break;
                case "line":
                    flushTextBuffer();
                    if (inCell) currentCellContent.push("<br/>");
                    else html.push("<br/>");
                    break;
                case "b":
                    flushTextBuffer();
                    currentState.bold = result.param !== 0;
                    break;
                case "i":
                    flushTextBuffer();
                    currentState.italic = result.param !== 0;
                    break;
                case "ul":
                    flushTextBuffer();
                    currentState.underline = true;
                    break;
                case "ulnone":
                    flushTextBuffer();
                    currentState.underline = false;
                    break;
                case "strike":
                    flushTextBuffer();
                    currentState.strikethrough = result.param !== 0;
                    break;
                case "fs":
                    flushTextBuffer();
                    currentState.fontSize = result.param ?? 24;
                    break;
                case "cf":
                    // Color index for text color
                    flushTextBuffer();
                    currentState.colorIndex = result.param ?? 0;
                    currentState.color = colorTable[result.param ?? 0] || "#000000";
                    break;
                case "qc":
                    // Center alignment
                    currentState.alignment = "center";
                    if (inCell) currentCellAlignment = "center";
                    break;
                case "qr":
                    // Right alignment
                    currentState.alignment = "right";
                    if (inCell) currentCellAlignment = "right";
                    break;
                case "ql":
                    // Left alignment
                    currentState.alignment = "left";
                    if (inCell) currentCellAlignment = "left";
                    break;
                case "qj":
                    // Justified alignment
                    currentState.alignment = "justify";
                    if (inCell) currentCellAlignment = "justify";
                    break;
                case "plain":
                    flushTextBuffer();
                    currentState.bold = false;
                    currentState.italic = false;
                    currentState.underline = false;
                    currentState.strikethrough = false;
                    currentState.color = "#000000";
                    currentState.colorIndex = 0;
                    break;
                case "tab":
                    textBuffer += "\t";
                    break;
                case "'": {
                    const hexCode = rtf.substring(i, i + 2);
                    const charCode = parseInt(hexCode, 16);
                    if (!isNaN(charCode)) {
                        textBuffer += String.fromCharCode(charCode);
                    }
                    i += 2;
                    break;
                }
                case "u":
                    if (result.param !== undefined) {
                        const unicodeChar =
                            result.param < 0
                                ? String.fromCharCode(result.param + 65536)
                                : String.fromCharCode(result.param);
                        textBuffer += unicodeChar;
                        if (i < rtf.length && rtf[i] === "?") i++;
                    }
                    break;
                case "~":
                    textBuffer += "\u00A0";
                    break;
                case "_":
                    textBuffer += "\u2011";
                    break;
                case "-":
                    break;

                // Table commands
                case "trowd":
                    // If we're already in a table, this is a continuation
                    // Tables in RTF are defined row by row, each with its own \trowd
                    if (!inTable) {
                        // Start a new table - but only close previous if there's actual text content between
                        // Check if there's been any visible text since last row (not just RTF commands)
                        if (lastRowEndIndex >= 0 && tableRows.length > 0) {
                            const between = rtf.substring(lastRowEndIndex, i);
                            // Look for text content that's not just RTF control words or whitespace
                            // Remove RTF commands, braces, and whitespace to see if there's actual text
                            const textContent = between
                                .replace(/\\[a-z]+\d*/gi, "") // Remove control words
                                .replace(/[{}\\]/g, "") // Remove braces and backslashes
                                .replace(/\s+/g, ""); // Remove whitespace

                            if (textContent.length > 0) {
                                closeTable(); // There's actual text between tables
                            }
                        }
                        inTable = true;
                    }
                    inRow = true;
                    currentCellWidths = []; // Reset cell widths for new row definition
                    break;
                case "cellx":
                    // Store cell right edge position (in twips)
                    if (result.param !== undefined) {
                        currentCellWidths.push(result.param);
                    }
                    break;
                case "row":
                    closeRow();
                    lastRowEndIndex = i; // Track where this row ended
                    break;
                case "cell":
                    closeCell();
                    break;
                case "intbl":
                    if (!inCell && inRow) openCell();
                    currentState.inTable = true;
                    break;
                case "pard":
                    // Don't close table on pard - tables continue until we see non-table content
                    // The table will be closed when we encounter text outside of \intbl context
                    currentState.inTable = false;
                    break;

                // Groups to skip entirely
                case "fonttbl":
                case "colortbl":
                case "stylesheet":
                case "info":
                case "listtable":
                case "listoverridetable":
                case "generator":
                case "shp":
                case "shpinst":
                case "object":
                case "objemb":
                case "objdata":
                case "nonshppict":
                case "mmathPict":
                case "fldinst":
                case "datafield":
                case "themedata":
                case "colorschememapping":
                case "latentstyles":
                case "datastore":
                case "xmlnstbl":
                case "picprop":
                    skipDepth = 1;
                    break;

                // Skip header/formatting control words
                case "rtf":
                case "ansi":
                case "ansicpg":
                case "deff":
                case "deflang":
                case "deflangfe":
                case "uc":
                case "viewkind":
                case "lang":
                case "langnp":
                case "langfe":
                case "langfenp":
                case "f":
                case "cb":
                case "highlight":
                case "li":
                case "ri":
                case "fi":
                case "sa":
                case "sb":
                case "sl":
                case "slmult":
                case "tx":
                case "tqr":
                case "tqc":
                case "sect":
                    // Section break - close any open table
                    if (inTable && !inRow) {
                        closeTable();
                    }
                    break;
                case "sbknone":
                case "sbkpage":
                case "cols":
                case "colno":
                case "colw":
                case "guttersxn":
                case "headery":
                case "footery":
                case "header":
                case "headerf":
                case "footer":
                case "footerf":
                case "titlepg":
                case "paperw":
                case "paperh":
                case "margt":
                case "margb":
                case "margl":
                case "margr":
                case "deftab":
                case "pntext":
                case "ltrch":
                case "rtlch":
                case "cgrid":
                case "noproof":
                case "itap":
                case "rin":
                case "lin":
                case "tposyil":
                case "trrh":
                case "trkeep":
                case "trleft":
                case "trftsWidth":
                case "lastrow":
                case "clvertalt":
                case "clvertalc":
                case "clvertalb":
                case "clpadft":
                case "clpadt":
                case "clpadfr":
                case "clpadr":
                case "clpadfl":
                case "clpadl":
                case "clpadfb":
                case "clpadb":
                case "clftsWidth":
                case "clwWidth":
                case "clbrdrt":
                case "clbrdrb":
                case "clbrdrl":
                case "clbrdrr":
                case "brdrs":
                case "brdrw":
                case "trgaph":
                case "trpaddl":
                case "trpaddr":
                case "trpaddt":
                case "trpaddb":
                case "trpaddfl":
                case "trpaddfr":
                case "trpaddft":
                case "trpaddfb":
                case "clcbpat":
                case "shpleft":
                case "shptop":
                case "shpright":
                case "shpbottom":
                case "shpz":
                case "shpwr":
                case "shpwrk":
                case "shpfhdr":
                case "shpbxpage":
                case "shpbypage":
                case "shpfblwtxt":
                case "pict":
                case "pngblip":
                case "jpegblip":
                case "emfblip":
                case "wmetafile":
                case "picw":
                case "pich":
                case "picwgoal":
                case "pichgoal":
                case "picscalex":
                case "picscaley":
                case "piccropl":
                case "piccropr":
                case "piccropt":
                case "piccropb":
                case "bliptag":
                case "blipuid":
                    break;
            }
        } else if (char === "\n" || char === "\r") {
            i++;
        } else {
            textBuffer += char;
            // Check for image placeholders periodically
            if (textBuffer.includes("__IMG_PLACEHOLDER_")) {
                checkImagePlaceholder();
            }
            i++;
        }
    }

    flushTextBuffer();
    closeTable();
    html.push("</p>");

    let result = html.join("");

    // Clean up the output
    result = result
        .replace(/\*+/g, "")
        .replace(/[0-9A-Fa-f]{30,}/g, "")
        // Normalize multiple spaces to single space, but preserve single spaces
        .replace(/[ \t]{2,}/g, " ")
        // Trim spaces at the start and end of paragraphs and cells
        .replace(/<p>\s+/g, "<p>")
        .replace(/\s+<\/p>/g, "</p>")
        .replace(/<td([^>]*)>\s+/g, "<td$1>")
        .replace(/\s+<\/td>/g, "</td>")
        .replace(/<p>\s*<\/p>/g, "")
        .replace(/<p>\s*<br\/>/g, "<p>")
        .replace(/<br\/>\s*<\/p>/g, "</p>")
        .replace(/<p>\s*<table/g, "<table")
        .replace(/<\/table>\s*<\/p>/g, "</table>")
        .replace(/(<\/p>)\s*(<p>)/g, "$1\n$2")
        .trim();

    if (!result || result === "<p></p>") {
        return "<p></p>";
    }

    return result;
}

/**
 * Apply text formatting
 */
function applyFormattingToText(text: string, state: RTFParserState): string {
    if (!text) return "";

    let formatted = escapeHtml(text);
    formatted = formatted.replace(/\t/g, "&emsp;");

    if (state.bold) formatted = `<strong>${formatted}</strong>`;
    if (state.italic) formatted = `<em>${formatted}</em>`;
    if (state.underline) formatted = `<u>${formatted}</u>`;
    if (state.strikethrough) formatted = `<s>${formatted}</s>`;

    const styles: string[] = [];
    if (state.fontSize !== 24) {
        styles.push(`font-size: ${state.fontSize / 2}pt`);
    }
    if (state.color && state.color !== "#000000") {
        styles.push(`color: ${state.color}`);
    }

    if (styles.length > 0) {
        formatted = `<span style="${styles.join("; ")}">${formatted}</span>`;
    }

    return formatted;
}

/**
 * Parse a control word
 */
function parseControlWord(rtf: string, startIndex: number): { word: string; param?: number; newIndex: number } {
    let i = startIndex + 1;
    let word = "";
    let paramStr = "";
    let hasParam = false;

    if (i < rtf.length) {
        const nextChar = rtf[i];
        if (
            nextChar === "\\" ||
            nextChar === "{" ||
            nextChar === "}" ||
            nextChar === "~" ||
            nextChar === "-" ||
            nextChar === "_" ||
            nextChar === "*"
        ) {
            return { word: nextChar, newIndex: i + 1 };
        }
        if (nextChar === "'") {
            return { word: "'", newIndex: i + 1 };
        }
        if (nextChar === "\n" || nextChar === "\r") {
            return { word: "par", newIndex: i + 1 };
        }
    }

    while (i < rtf.length && /[a-zA-Z]/.test(rtf[i])) {
        word += rtf[i];
        i++;
    }

    if (i < rtf.length && /[-\d]/.test(rtf[i])) {
        hasParam = true;
        if (rtf[i] === "-") {
            paramStr += rtf[i];
            i++;
        }
        while (i < rtf.length && /\d/.test(rtf[i])) {
            paramStr += rtf[i];
            i++;
        }
    }

    if (i < rtf.length && rtf[i] === " ") {
        i++;
    }

    return {
        word,
        param: hasParam ? parseInt(paramStr, 10) : undefined,
        newIndex: i,
    };
}

/**
 * Create initial state
 */
function createInitialState(): RTFParserState {
    return {
        bold: false,
        italic: false,
        underline: false,
        strikethrough: false,
        fontSize: 24,
        fontFamily: "Arial",
        color: "#000000",
        colorIndex: 0,
        backgroundColor: "",
        inPicture: false,
        pictureType: "unknown",
        pictureData: "",
        pictureWidth: 0,
        pictureHeight: 0,
        inTable: false,
        skipContent: false,
        alignment: "left",
    };
}

/**
 * Convert hex to base64
 */
function hexToBase64(hex: string): string {
    if (!hex || hex.length === 0) return "";

    try {
        const cleanHex = hex.replace(/[^0-9a-fA-F]/g, "");
        if (cleanHex.length < 2) return "";

        const bytes: number[] = [];
        for (let j = 0; j < cleanHex.length - 1; j += 2) {
            const byte = parseInt(cleanHex.substring(j, j + 2), 16);
            if (!isNaN(byte)) bytes.push(byte);
        }

        if (bytes.length === 0) return "";

        const uint8Array = new Uint8Array(bytes);
        let binary = "";
        const chunkSize = 0x8000;

        for (let j = 0; j < uint8Array.length; j += chunkSize) {
            const chunk = uint8Array.subarray(j, j + chunkSize);
            binary += String.fromCharCode.apply(null, Array.from(chunk));
        }

        return btoa(binary);
    } catch (error) {
        console.error("Error converting hex to base64:", error);
        return "";
    }
}

/**
 * Get MIME type
 */
function getMimeType(pictureType: string): string {
    switch (pictureType.toLowerCase()) {
        case "png":
        case "pngblip":
            return "image/png";
        case "jpeg":
        case "jpegblip":
        case "jpg":
            return "image/jpeg";
        case "gif":
            return "image/gif";
        case "emf":
        case "emfblip":
            return "image/x-emf";
        case "wmf":
        case "wmetafile":
            return "image/x-wmf";
        case "bmp":
        case "dibitmap":
            return "image/bmp";
        default:
            return "image/png";
    }
}

/**
 * Extract plain text (fallback)
 */
export function extractPlainTextFromRTF(rtf: string): string {
    const text = rtf
        .replace(/\{\\fonttbl[^}]*\}/gi, "")
        .replace(/\{\\colortbl[^}]*\}/gi, "")
        .replace(/\{\\stylesheet[^}]*\}/gi, "")
        .replace(/\{\\info[^}]*\}/gi, "")
        .replace(/\{\\pict[^}]*\}/gi, "[Image]")
        .replace(/\{\\shp[^}]*\}/gi, "")
        .replace(/\\'([0-9a-f]{2})/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
        .replace(/\\u(\d+)\?/g, (_, code) => String.fromCharCode(parseInt(code)))
        .replace(/\\u(-?\d+)/g, (_, code) => {
            const num = parseInt(code);
            return String.fromCharCode(num < 0 ? num + 65536 : num);
        })
        .replace(/\\par\s?/gi, "\n")
        .replace(/\\line\s?/gi, "\n")
        .replace(/\\tab\s?/gi, "\t")
        .replace(/\\cell\s?/gi, "\t")
        .replace(/\\row\s?/gi, "\n")
        .replace(/\\[a-z]+\d*\s?/gi, "")
        .replace(/[{}]/g, "")
        .replace(/[ \t]+/g, " ")
        .replace(/\n +/g, "\n")
        .replace(/ +\n/g, "\n")
        .replace(/\n{3,}/g, "\n\n")
        .trim();

    return text;
}

function escapeHtml(text: string): string {
    const htmlEntities: Record<string, string> = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
    };
    return text.replace(/[&<>"']/g, (char) => htmlEntities[char] || char);
}

export function isRTFContent(content: string): boolean {
    return content.trim().startsWith("{\\rtf");
}

export default {
    convertRTFToHTML,
    isRTFContent,
    extractPlainTextFromRTF,
};
