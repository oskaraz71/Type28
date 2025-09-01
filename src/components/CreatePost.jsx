import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../store/store";

/**
 * Props:
 * - post?: { id, title, image, description }
 */
export default function CreatePost({ post }) {
    const navigate   = useNavigate();
    const createNews = useStore((s) => s.createNews);
    const updateNews = useStore((s) => s.updateNews);

    const isEdit = Boolean(post?.id);

    const [title, setTitle] = useState("");
    const [image, setImage] = useState("");
    const [description, setDescription] = useState("");
    const [busy, setBusy] = useState(false);
    const [err, setErr] = useState("");

    // peržiūros valdymas
    const [imgError, setImgError] = useState(false);

    useEffect(() => {
        if (post) {
            setTitle(post.title || "");
            setImage(post.image || "");
            setDescription(post.description || "");
        }
    }, [post]);

    // jei keičiasi URL – išvalom klaidos būseną
    useEffect(() => {
        setImgError(false);
    }, [image]);

    const onSubmit = async (e) => {
        e.preventDefault();
        setErr("");
        setBusy(true);
        try {
            const payload = {
                title: title.trim(),
                image: image.trim(),
                description: description.trim(),
            };
            if (isEdit) {
                await updateNews({ id: post.id, ...payload });
            } else {
                await createNews(payload);
            }
            navigate("/news");
        } catch (e2) {
            setErr(e2?.message || "Failed to save post");
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="form-container">
            <h1>{isEdit ? "Edit post" : "Create post"}</h1>

            <form onSubmit={onSubmit} className="auth-form">
                <div className="form-group">
                    <label htmlFor="post-title">Title</label>
                    <input
                        id="post-title"
                        className="input"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        minLength={10}
                        placeholder="Enter a descriptive title"
                        required
                    />
                </div>

                {/* --- IMAGE PREVIEW --- */}
                <div className="form-group">
                    <label>Image preview</label>
                    <div
                        style={{
                            width: "100%",
                            height: 220,
                            border: "1px solid var(--border, #e5e7eb)",
                            borderRadius: 10,
                            background: "#fff",
                            display: "grid",
                            placeItems: "center",
                            overflow: "hidden",
                        }}
                    >
                        {image && !imgError ? (
                            <img
                                src={image}
                                alt="Preview"
                                style={{ width: "100%", height: "100%", objectFit: "contain" }}
                                onError={() => setImgError(true)}
                            />
                        ) : (
                            <span style={{ color: "#6b7280", fontSize: 14 }}>
                {image
                    ? "Image failed to load. Check URL."
                    : "Enter an image URL below to preview"}
              </span>
                        )}
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="post-image">Image URL</label>
                    <input
                        id="post-image"
                        className="input"
                        type="url"
                        value={image}
                        onChange={(e) => setImage(e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="post-desc">Description</label>
                    <textarea
                        id="post-desc"
                        className="input"
                        rows={8}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        minLength={30}
                        placeholder="Write your story…"
                        required
                    />
                </div>

                {err && <p className="form-error" role="alert">{err}</p>}

                <button className="btn block" type="submit" disabled={busy}>
                    {busy ? "Saving…" : isEdit ? "Save changes" : "Create"}
                </button>
            </form>
        </div>
    );
}
