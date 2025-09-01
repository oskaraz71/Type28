console.log("[Post.jsx] LOADED v2");
export default function Post({
                                 p,
                                 canEdit,
                                 onView,
                                 onEdit,
                                 onDelete,
                                 onAuthor,
                                 onToggleLike,
                                 onShowLikes,
                                 currentUserId,
                             }) {
    // apsauga: jei p nėra, dirbam su tuščiu obj., kad nerodytų klaidų
    const post = p || {};

    // laikas
    const when =
        post.created_at && !Number.isNaN(new Date(post.created_at).getTime())
            ? new Date(post.created_at).toLocaleString()
            : "";

    // prisijungusio naudotojo id
    let uid = currentUserId;
    if (!uid) {
        try {
            const u = JSON.parse(localStorage.getItem("blogUser") || "null");
            uid = u?.id || u?._id || null;
        } catch {}
    }

    // like skaičius
    const likeCount =
        typeof post.likes_count === "number"
            ? post.likes_count
            : Array.isArray(post.likes)
                ? post.likes.length
                : 0;

    // ar jau patikta?
    const isLiked = Boolean(
        post.is_liked ??
        (Array.isArray(post.likes) && uid
            ? post.likes.some((x) => String(x) === String(uid))
            : false)
    );
    console.log("[Post] render", {
        id: post.id, title: post.title,
        likeCount,
        isLiked,
        hasLikesArr: Array.isArray(post.likes),
    });

    // debug
    const open = (e) => {
        e.preventDefault();
        onView?.(post);
    };

    // širdutės SVG
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

    // toggle like/unlike
    function handleHeartClick(e) {
        e?.preventDefault?.();
        e?.stopPropagation?.();
        console.log("[Post] heart click (toggle)", { postId: post.id, isLiked });
        if (typeof onToggleLike === "function") onToggleLike(post, isLiked);
    }

    // parodyti kas palaikino (modal)
    function handleShowLikes(e) {
        e?.preventDefault?.();
        e?.stopPropagation?.();
        console.log("[Post] show likes", { postId: post.id });
        onShowLikes?.(post);
    }

    return (
        <div className="card product-card post-card">
            {/* media */}
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

                {/* Actions */}
                <div style={{ display: "flex", gap: 8, marginTop: 8, alignItems: "center" }}>
                    {/* ♥ tik piktograma (ne mygtukas) */}
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

                    {/* tik SKAIČIUS — paspaudus atidaro modalą */}
                    <span
                        role="button"
                        tabIndex={0}
                        onClick={handleShowLikes}
                        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleShowLikes(e)}
                        title="Show who liked"
                        style={{ fontSize: 13, color: "#111827", cursor: "pointer", userSelect: "none" }}
                    >
            {likeCount}
          </span>

                    {/* View/Edit/Delete */}
                    <button className="btn" onClick={open}>View</button>
                    {canEdit && (
                        <>
                            <button className="btn" onClick={() => onEdit?.(post)}>Edit</button>
                            <button className="btn danger" onClick={() => onDelete?.(post)}>Delete</button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
