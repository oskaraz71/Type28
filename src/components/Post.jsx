// src/components/Post.jsx
console.log("[Post.jsx] LOADED comments+likes bar + likes modal trigger");

export default function Post({
                                 p,
                                 canEdit,
                                 onView,
                                 onEdit,
                                 onDelete,
                                 onAuthor,
                                 onToggleLike,   // toggle like (POST/DELETE /like)
                                 onShowLikes,    // <-- PASPAUDUS ANT SKAIČIAUS – ATIDARO MODALĄ
                                 currentUserId,  // optional
                             }) {
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

    // likes & comments count
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

    // atidaryti post modalą
    function open(e) {
        e?.preventDefault?.();
        onView?.(post);
    }

    // širdies SVG
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

    // komentarų burbulas
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

    // like toggle
    function handleHeartClick(e) {
        e?.preventDefault?.();
        e?.stopPropagation?.();
        if (typeof onToggleLike === "function") onToggleLike(post, isLiked);
    }

    // parodyti, kas palaikino (LIKES MODAL)
    function handleShowLikes(e) {
        e?.preventDefault?.();
        e?.stopPropagation?.();
        if (typeof onShowLikes === "function") onShowLikes(post);
    }

    // atidaryti komentarus (per post modalą)
    function openComments(e) {
        e?.preventDefault?.();
        e?.stopPropagation?.();
        onView?.(post);
    }

    return (
        <div className="card product-card post-card">
            {/* MEDIA – atidaro post modalą */}
            <div
                className="product-media"
                onClick={open}
                title="Open"
                style={{ cursor: "pointer" }}
            >
                <img src={post.image_url} alt="" />
            </div>

            <div className="product-body">
                <h3 className="title" style={{ margin: 0 }}>
                    <a
                        href="#"
                        onClick={open}
                        style={{ textDecoration: "none", color: "inherit" }}
                    >
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
                        {post.description.length > 140
                            ? post.description.slice(0, 140) + "…"
                            : post.description}
                    </div>
                ) : null}

                {/* Veiksmai – kairė: ♥ + skaičius (skaičius atidaro likes modalą); dešinė: komentarai */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        marginTop: 8,
                        justifyContent: "space-between",
                    }}
                >
                    {/* KAIRĖ: ♥ toggle + SKAIČIUS (skaičius – modalas) */}
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <span
                role="button"
                tabIndex={0}
                onClick={handleHeartClick}
                onKeyDown={(e) =>
                    (e.key === "Enter" || e.key === " ") && handleHeartClick(e)
                }
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

                        {/* SKAIČIUS – paspaudus atidaro likes modalą */}
                        <span
                            role="button"
                            tabIndex={0}
                            onClick={handleShowLikes}
                            onKeyDown={(e) =>
                                (e.key === "Enter" || e.key === " ") && handleShowLikes(e)
                            }
                            title="Show who liked"
                            style={{
                                fontSize: 13,
                                color: "#111827",
                                cursor: "pointer",
                                userSelect: "none",
                            }}
                        >
              {likeCount}
            </span>
                    </div>

                    {/* DEŠINĖ: komentarai – atidarom post modalą su komentarais */}
                    <div
                        role="button"
                        tabIndex={0}
                        onClick={openComments}
                        onKeyDown={(e) =>
                            (e.key === "Enter" || e.key === " ") && openComments(e)
                        }
                        title="Show comments"
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            cursor: "pointer",
                        }}
                    >
                        <CommentIcon />
                        <span style={{ fontSize: 13, color: "#111827", userSelect: "none" }}>
              {commentsCount}
            </span>
                    </div>
                </div>

                {/* Edit/Delete – jei gali redaguoti */}
                {canEdit && (
                    <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                        <button className="btn" onClick={() => onEdit?.(post)}>
                            Edit
                        </button>
                        <button className="btn danger" onClick={() => onDelete?.(post)}>
                            Delete
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

