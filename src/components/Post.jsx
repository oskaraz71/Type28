// src/components/Post.jsx
console.log("[Post.jsx] LOADED comments+likes bar + top-right owner actions");

export default function Post({
                                 p,
                                 canEdit,
                                 onView,
                                 onEdit,
                                 onDelete,
                                 onAuthor,
                                 onToggleLike,   // toggle like (frontend iškvies /like POST/DELETE)
                                 currentUserId,  // optional
                             }) {
    const post = p || {};

    const when =
        post.created_at && !Number.isNaN(new Date(post.created_at).getTime())
            ? new Date(post.created_at).toLocaleString()
            : "";

    // prisijungusio naudotojo id (jei nepaduoda per props — paimam iš localStorage)
    let uid = currentUserId;
    if (!uid) {
        try {
            const u = JSON.parse(localStorage.getItem("blogUser") || "null");
            uid = u?.id || u?._id || null;
        } catch {}
    }

    // likes & comments count (suderinamumas su skirtingais laukais)
    const likeCount =
        typeof post.likes_count === "number"
            ? post.likes_count
            : Array.isArray(post.likes)
                ? post.likes.length
                : 0;

    const commentsCount =
        typeof post.comments_count === "number"
            ? post.comments_count
            : Array.isArray(post.comments)
                ? post.comments.length
                : 0;

    // ar jau patikta?
    const isLiked = Boolean(
        post.is_liked ??
        (Array.isArray(post.likes) && uid
            ? post.likes.some((x) => String(x) === String(uid))
            : false)
    );

    console.log("[Post] render", {
        id: post.id,
        title: post.title,
        likeCount,
        commentsCount,
        isLiked,
        canEdit,
    });

    const open = (e) => {
        e.preventDefault();
        onView?.(post);
    };

    // ikonėlės
    function HeartIcon({ filled = false, size = 18 }) {
        const color = "#e11d48";
        return (
            <svg
                width={size}
                height={size}
                viewBox="0 0 24 24"
                fill={filled ? color : "transparent"}
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                style={{ display: "block" }}
            >
                <path d="M20.8 4.6c-1.7-1.7-4.6-1.7-6.3 0L12 7.1 9.5 4.6c-1.7-1.7-4.6-1.7-6.3 0-1.7 1.7-1.7 4.6 0 6.3l2.5 2.5L12 21l6.3-7.6 2.5-2.5c1.7-1.7 1.7-4.6 0-6.3z" />
            </svg>
        );
    }
    function CommentIcon({ size = 18 }) {
        return (
            <svg
                width={size}
                height={size}
                viewBox="0 0 24 24"
                fill="none"
                stroke="#111827"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                style={{ display: "block" }}
            >
                <path d="M21 15a4 4 0 0 1-4 4H7l-4 4V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
            </svg>
        );
    }
    function PencilIcon({ size = 16 }) {
        return (
            <svg
                width={size}
                height={size}
                viewBox="0 0 24 24"
                fill="none"
                stroke="#111827"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                style={{ display: "block" }}
            >
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
            </svg>
        );
    }
    function XIcon({ size = 16 }) {
        return (
            <svg
                width={size}
                height={size}
                viewBox="0 0 24 24"
                fill="none"
                stroke="#dc2626"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                style={{ display: "block" }}
            >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
        );
    }

    function handleHeartClick(e) {
        e?.preventDefault?.();
        e?.stopPropagation?.();
        console.log("[Post] heart click", { id: post.id, isLiked });
        if (typeof onToggleLike === "function") onToggleLike(post, isLiked);
    }

    function openComments(e) {
        e?.preventDefault?.();
        e?.stopPropagation?.();
        console.log("[Post] open comments", { id: post.id });
        onView?.(post); // atidaro modalą su komentarais
    }

    function handleEditClick(e) {
        e?.preventDefault?.();
        e?.stopPropagation?.();
        console.log("[Post] EDIT click", { id: post.id });
        onEdit?.(post);
    }

    function handleDeleteClick(e) {
        e?.preventDefault?.();
        e?.stopPropagation?.();
        console.log("[Post] DELETE click", { id: post.id });
        onDelete?.(post);
    }

    return (
        <div className="card product-card post-card" style={{ position: "relative" }}>
            {/* SAVININKO VEIKSMAI – dešinysis viršutinis kampas */}
            {canEdit && (
                <div
                    style={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        display: "inline-flex",
                        gap: 8,
                        zIndex: 2,
                    }}
                >
                    <button
                        type="button"
                        title="Edit post"
                        onClick={handleEditClick}
                        style={{
                            border: "1px solid #e5e7eb",
                            background: "#fff",
                            borderRadius: 8,
                            padding: 6,
                            cursor: "pointer",
                        }}
                    >
                        <PencilIcon />
                    </button>
                    <button
                        type="button"
                        title="Delete post"
                        onClick={handleDeleteClick}
                        style={{
                            border: "1px solid #fecaca",
                            background: "#fff",
                            borderRadius: 8,
                            padding: 6,
                            cursor: "pointer",
                        }}
                    >
                        <XIcon />
                    </button>
                </div>
            )}

            {/* MEDIA – spaudžiam atidaryti modalą */}
            <div className="product-media" onClick={open} title="Open" style={{ cursor: "pointer" }}>
                <img src={post.image_url} alt="" />
            </div>

            <div className="product-body">
                <h3 className="title" style={{ margin: 0 }}>
                    <a href="#" onClick={open} style={{ textDecoration: "none", color: "inherit" }}>
                        {post.title}
                    </a>
                </h3>

                <div className="muted" style={{ fontSize: 12 }}>
                    <button
                        type="button"
                        onClick={() => onAuthor?.(post)}
                        title="Show author's posts"
                        style={{
                            padding: 0,
                            border: "none",
                            background: "transparent",
                            color: "#2563eb",
                            cursor: "pointer",
                        }}
                    >
                        {post.user_name || post.user_email || "anonymous"}
                    </button>{" "}
                    {when ? <>• {when}</> : null}
                </div>

                {post.description ? (
                    <div className="muted" style={{ fontSize: 13, lineHeight: 1.4 }}>
                        {post.description.length > 140 ? post.description.slice(0, 140) + "…" : post.description}
                    </div>
                ) : null}

                {/* VEIKSMAI: like kairėje, komentarai dešinėje */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        marginTop: 8,
                        justifyContent: "space-between",
                    }}
                >
                    {/* Like (♥ + count) KAIRĖJE */}
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <span
                role="button"
                tabIndex={0}
                onClick={handleHeartClick}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleHeartClick(e)}
                title={isLiked ? "Unlike" : "Like"}
                aria-pressed={isLiked}
                style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    padding: 4,
                    borderRadius: 8,
                    userSelect: "none",
                }}
            >
              <HeartIcon filled={isLiked} />
            </span>
                        <span style={{ fontSize: 13, color: "#111827", userSelect: "none" }}>{likeCount}</span>
                    </div>

                    {/* Komentarai (ikonėlė + count) DEŠINĖJE */}
                    <div
                        role="button"
                        tabIndex={0}
                        onClick={openComments}
                        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && openComments(e)}
                        title="Show comments"
                        style={{ display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer" }}
                    >
                        <CommentIcon />
                        <span style={{ fontSize: 13, color: "#111827", userSelect: "none" }}>{commentsCount}</span>
                    </div>
                </div>

                {/* (Apačios Edit/Delete mygtukus panaikinau — dabar ikonėlės viršuje) */}
            </div>
        </div>
    );
}
