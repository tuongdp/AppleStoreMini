import { useCallback, useRef, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import ImageExtension from "@tiptap/extension-image";
import LinkExtension from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import {
    Bold,
    Italic,
    Underline as UnderlineIcon,
    Strikethrough,
    Heading1,
    Heading2,
    Heading3,
    List,
    ListOrdered,
    Link,
    Image,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUploadEditorImageMutation } from "@/store/api/productsApi";
import { toast } from "sonner";

const MenuButton = ({ onClick, active, children, title }) => (
    <button
        type="button"
        onClick={onClick}
        title={title}
        className={cn(
            "flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
            active && "bg-muted text-foreground",
        )}
    >
        {children}
    </button>
);

export default function RichTextEditor({ value, onChange, placeholder, disabled }) {
    const fileRef = useRef(null);
    const [uploadImage] = useUploadEditorImageMutation();
    const uploadingRef = useRef(false);

    const insertImages = useCallback(async (files) => {
        if (!files.length || uploadingRef.current) return;
        uploadingRef.current = true;

        const valid = Array.from(files).filter(
            (f) => f.type.startsWith("image/") && f.size <= 5 * 1024 * 1024,
        );
        if (valid.length !== files.length) {
            toast.error("Chỉ chấp nhận file ảnh dưới 5MB");
        }
        if (!valid.length) { uploadingRef.current = false; return; }

        const toastId = toast.loading(`Đang tải lên ${valid.length} ảnh...`);
        let inserted = 0;

        for (const file of valid) {
            try {
                const fd = new FormData();
                fd.append("image", file);
                const res = await uploadImage(fd).unwrap();
                editorRef.current?.chain().focus().setImage({ src: res.url }).run();
                inserted++;
            } catch {
                toast.error(`Tải ảnh "${file.name}" lên thất bại`);
            }
        }

        if (inserted > 0) {
            toast.success(`Đã chèn ${inserted} ảnh`, { id: toastId });
        } else {
            toast.dismiss(toastId);
        }
        uploadingRef.current = false;
    }, [uploadImage]);

    const editorRef = useRef(null);

    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            ImageExtension,
            LinkExtension.configure({ openOnClick: false }),
            Placeholder.configure({ placeholder: placeholder || "Viết mô tả sản phẩm..." }),
        ],
        content: value || "",
        editable: !disabled,
        onUpdate: ({ editor }) => {
            onChange?.(editor.getHTML());
        },
        editorProps: {
            handlePaste: (view, event) => {
                const items = event.clipboardData?.items;
                if (!items) return false;
                const files = [];
                for (let i = 0; i < items.length; i++) {
                    const item = items[i];
                    if (item.kind === "file" && item.type.startsWith("image/")) {
                        const file = item.getAsFile();
                        if (file) files.push(file);
                    }
                }
                if (files.length) {
                    insertImages(files);
                    return true;
                }
                return false;
            },
            handleDrop: (view, event) => {
                const files = event.dataTransfer?.files;
                if (!files?.length) return false;
                const imageFiles = Array.from(files).filter((f) =>
                    f.type.startsWith("image/"),
                );
                if (imageFiles.length) {
                    event.preventDefault();
                    insertImages(imageFiles);
                    return true;
                }
                return false;
            },
        },
    });

    editorRef.current = editor;

    useEffect(() => {
        if (editor && value !== editor.getHTML()) {
            editor.commands.setContent(value || "", false);
        }
    }, [editor, value]);

    const handleFileInput = useCallback(async (e) => {
        await insertImages(e.target.files);
        if (fileRef.current) fileRef.current.value = "";
    }, [insertImages]);

    const setLink = useCallback(() => {
        if (!editor) return;
        const previousUrl = editor.getAttributes("link").href;
        const url = window.prompt("Nhập URL:", previousUrl || "");
        if (url === null) return;
        if (url === "") {
            editor.chain().focus().extendMarkRange("link").unsetLink().run();
            return;
        }
        editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    }, [editor]);

    if (!editor) return null;

    return (
        <div className={cn(
            "overflow-hidden rounded-xl border border-border",
            disabled && "pointer-events-none opacity-60",
        )}>
            <div className="flex flex-wrap items-center gap-0.5 border-b border-border bg-muted/30 px-2 py-1.5">
                <MenuButton
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    active={editor.isActive("bold")}
                    title="In đậm"
                >
                    <Bold className="h-4 w-4" />
                </MenuButton>
                <MenuButton
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    active={editor.isActive("italic")}
                    title="In nghiêng"
                >
                    <Italic className="h-4 w-4" />
                </MenuButton>
                <MenuButton
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    active={editor.isActive("underline")}
                    title="Gạch chân"
                >
                    <UnderlineIcon className="h-4 w-4" />
                </MenuButton>
                <MenuButton
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    active={editor.isActive("strike")}
                    title="Gạch ngang"
                >
                    <Strikethrough className="h-4 w-4" />
                </MenuButton>

                <div className="mx-1 h-5 w-px bg-border" />

                <MenuButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    active={editor.isActive("heading", { level: 1 })}
                    title="Heading 1"
                >
                    <Heading1 className="h-4 w-4" />
                </MenuButton>
                <MenuButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    active={editor.isActive("heading", { level: 2 })}
                    title="Heading 2"
                >
                    <Heading2 className="h-4 w-4" />
                </MenuButton>
                <MenuButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    active={editor.isActive("heading", { level: 3 })}
                    title="Heading 3"
                >
                    <Heading3 className="h-4 w-4" />
                </MenuButton>

                <div className="mx-1 h-5 w-px bg-border" />

                <MenuButton
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    active={editor.isActive("bulletList")}
                    title="Danh sách"
                >
                    <List className="h-4 w-4" />
                </MenuButton>
                <MenuButton
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    active={editor.isActive("orderedList")}
                    title="Danh sách có thứ tự"
                >
                    <ListOrdered className="h-4 w-4" />
                </MenuButton>

                <div className="mx-1 h-5 w-px bg-border" />

                <MenuButton onClick={setLink} active={editor.isActive("link")} title="Chèn liên kết">
                    <Link className="h-4 w-4" />
                </MenuButton>
                <MenuButton
                    onClick={() => fileRef.current?.click()}
                    active={false}
                    title="Chèn ảnh (Ctrl+V hoặc kéo thả)"
                >
                    <Image className="h-4 w-4" />
                </MenuButton>
            </div>

            <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileInput}
            />

            <div
                className="prose prose-sm max-w-none p-4"
                onDragOver={(e) => {
                    if (e.dataTransfer?.types.includes("Files")) {
                        e.preventDefault();
                        e.stopPropagation();
                    }
                }}
            >
                <EditorContent editor={editor} />
            </div>
        </div>
    );
}
