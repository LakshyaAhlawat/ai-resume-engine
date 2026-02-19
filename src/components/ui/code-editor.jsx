"use client"

import { useEffect, useRef, useCallback } from "react"
import { EditorView, keymap, lineNumbers, highlightActiveLineGutter, highlightActiveLine, drawSelection, dropCursor, rectangularSelection, highlightSpecialChars } from "@codemirror/view"
import { EditorState } from "@codemirror/state"
import { javascript } from "@codemirror/lang-javascript"
import { python } from "@codemirror/lang-python"
import { cpp } from "@codemirror/lang-cpp"
import { java } from "@codemirror/lang-java"
import { autocompletion, closeBrackets, closeBracketsKeymap, completionKeymap } from "@codemirror/autocomplete"
import { oneDark } from "@codemirror/theme-one-dark"
import { defaultKeymap, indentWithTab, history, historyKeymap } from "@codemirror/commands"
import { bracketMatching, indentOnInput, foldGutter, foldKeymap, syntaxHighlighting, defaultHighlightStyle } from "@codemirror/language"

const langMap = {
    javascript: () => javascript(),
    python: () => python(),
    cpp: () => cpp(),
    java: () => java(),
}

// Custom dark theme to match the arena aesthetic
const arenaTheme = EditorView.theme({
    "&": {
        backgroundColor: "#1e1e1e",
        color: "#d4d4d4",
        fontSize: "13px",
        fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Consolas', monospace",
        height: "100%",
    },
    ".cm-content": {
        caretColor: "#7c3aed",
        padding: "16px 8px",
        lineHeight: "1.6",
    },
    ".cm-cursor, .cm-dropCursor": {
        borderLeftColor: "#7c3aed",
        borderLeftWidth: "2px",
    },
    "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection": {
        backgroundColor: "rgba(124, 58, 237, 0.25)",
    },
    ".cm-activeLine": {
        backgroundColor: "rgba(255, 255, 255, 0.03)",
    },
    ".cm-activeLineGutter": {
        backgroundColor: "rgba(255, 255, 255, 0.05)",
    },
    ".cm-gutters": {
        backgroundColor: "#1e1e1e",
        color: "rgba(255,255,255,0.15)",
        border: "none",
        paddingRight: "8px",
    },
    ".cm-lineNumbers .cm-gutterElement": {
        minWidth: "3ch",
        padding: "0 4px 0 8px",
        fontSize: "11px",
    },
    ".cm-foldGutter .cm-gutterElement": {
        padding: "0 2px",
        color: "rgba(255,255,255,0.15)",
    },
    ".cm-tooltip-autocomplete": {
        backgroundColor: "#252525",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "12px",
        overflow: "hidden",
        boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
    },
    ".cm-tooltip-autocomplete > ul": {
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: "12px",
    },
    ".cm-tooltip-autocomplete > ul > li": {
        padding: "4px 12px",
        borderRadius: "0",
    },
    ".cm-tooltip-autocomplete > ul > li[aria-selected]": {
        backgroundColor: "rgba(124, 58, 237, 0.3)",
        color: "#fff",
    },
    ".cm-completionIcon": {
        fontSize: "90%",
        opacity: "0.7",
    },
    ".cm-matchingBracket": {
        backgroundColor: "rgba(124, 58, 237, 0.25)",
        outline: "1px solid rgba(124, 58, 237, 0.5)",
        color: "#fff !important",
    },
    ".cm-scroller": {
        overflow: "auto",
    },
    "&.cm-focused": {
        outline: "none",
    },
}, { dark: true })

export function CodeEditor({ value, onChange, language = "javascript" }) {
    const containerRef = useRef(null)
    const viewRef = useRef(null)
    const onChangeRef = useRef(onChange)

    // Keep onChange ref fresh
    useEffect(() => {
        onChangeRef.current = onChange
    }, [onChange])

    const createState = useCallback((doc, lang) => {
        const langExtension = langMap[lang] ? langMap[lang]() : javascript()
        
        return EditorState.create({
            doc,
            extensions: [
                lineNumbers(),
                highlightActiveLineGutter(),
                highlightActiveLine(),
                highlightSpecialChars(),
                history(),
                foldGutter(),
                drawSelection(),
                dropCursor(),
                rectangularSelection(),
                indentOnInput(),
                bracketMatching(),
                closeBrackets(),
                autocompletion({
                    activateOnTyping: true,
                    maxRenderedOptions: 15,
                }),
                langExtension,
                oneDark,
                arenaTheme,
                syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
                keymap.of([
                    ...closeBracketsKeymap,
                    ...defaultKeymap,
                    ...historyKeymap,
                    ...completionKeymap,
                    ...foldKeymap,
                    indentWithTab,
                ]),
                EditorView.updateListener.of((update) => {
                    if (update.docChanged) {
                        onChangeRef.current?.(update.state.doc.toString())
                    }
                }),
                EditorView.lineWrapping,
            ],
        })
    }, [])

    // Initialize editor
    useEffect(() => {
        if (!containerRef.current) return

        const state = createState(value || "", language)
        const view = new EditorView({
            state,
            parent: containerRef.current,
        })
        viewRef.current = view

        return () => {
            view.destroy()
            viewRef.current = null
        }
    }, []) // Only run once on mount

    // Update language without losing cursor position
    useEffect(() => {
        if (!viewRef.current) return
        const view = viewRef.current
        const currentDoc = view.state.doc.toString()
        const cursorPos = view.state.selection.main.head
        
        const state = createState(currentDoc, language)
        view.setState(state)
        
        // Restore cursor position
        const safePos = Math.min(cursorPos, view.state.doc.length)
        view.dispatch({ selection: { anchor: safePos, head: safePos } })
    }, [language, createState])

    // Sync external value changes (e.g., language switch, question switch)
    useEffect(() => {
        if (!viewRef.current) return
        const view = viewRef.current
        const currentDoc = view.state.doc.toString()
        if (value !== currentDoc) {
            view.dispatch({
                changes: { from: 0, to: currentDoc.length, insert: value || "" }
            })
        }
    }, [value])

    return (
        <div ref={containerRef} className="h-full w-full overflow-hidden" />
    )
}
