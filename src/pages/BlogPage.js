// src/pages/BlogPage.js
import { useEffect, useMemo, useRef, useState } from "react";
import Post from "../components/Post";
import PostModal from "../components/PostModal";
import styles from "./Blog.module.css";

const API_URL = "http://localhost:2500/api/blog";

/** saugus JSON */
function safeJson(res) {
    const ct = res.headers.get("content-type") || "";
    if (!ct.includes("application/json")) return Promise.resolve({});
    return res.json().catch(() => ({}));
}

/** JWT helperiai */
function getToken() {
    try { return localStorage.getItem("blogToken") || ""; } catch { return ""; }
}
function authHeaders() {
    const t = getToken();
    return t ? { Authorization: `Bearer ${t}` } : {};
}

export default function BlogPage() {
    const [user, setUser] = useState(null); // { id, email, userName }
    const [rEmail, setREmail] = useState("");
    const [rPwd1, setRPwd1] = useState("");
    const [rPwd2, setRPwd2] = useState("");
    const [lEmail, setLEmail] = useState("");
    const [lPwd, setLPwd] = useState("");

    const [rMsg, setRMsg] = useState("");
    const [lMsg, setLMsg] = useState("");

    const [title, setTitle] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [description, setDescription] = useState("");
    const [cMsg, setCMsg] = useState("");

    const [editPost, setEditPost] = useState(null);
    const formRef = useRef(null);

    const [order, setOrder] = useState("desc");
    const [posts, setPosts] = useState([]);
    const [activePost, setActivePost] = useState(null);

    // filtravimas pagal autorių (local)
    const [onlyAuthor, setOnlyAuthor] = useState(null); // {email, name}

    // LIKES modal
    const [likesPost, setLikesPost] = useState(null);
    const [likesUsers, setLikesUsers] = useState([]);
    const [likesLoading, setLikesLoading] = useState(false);
    const [likesError, setLikesError] = useState("");

    // COMMENTS (single post modal)
    const [comments, setComments] = useState([]);
    const [commentsLoading, setCommentsLoading] = useState(false);
    const [commentsError, setCommentsError] = useState("");
    const [newComment, setNewComment] = useState("");

    useEffect(() => {
        try {
            const raw = localStorage.getItem("blogUser");
            if (raw) setUser(JSON.parse(raw));
        } catch {}
    }, []);

    useEffect(() => {
        console.log("[BlogPage] user =", user, "hasToken?=", Boolean(getToken()));
    }, [user]);

    useEffect(() => {
        loadPosts(order);
    }, [order]);

    async function loadPosts(ord = "desc") {
        try {
            console.log("[POSTS] loadPosts", { ord, hasToken: Boolean(getToken()) });
            const res = await fetch(`${API_URL}/posts?order=${ord}`, { headers: { ...authHeaders() } });
            const data = await safeJson(res);
            console.log("[POSTS] list status", res.status, data);
            if (!res.ok || data.success === false) throw new Error(data.message || `HTTP ${res.status}`);
            setPosts(Array.isArray(data.posts) ? data.posts : []);
        } catch (e) {
            console.error("[POSTS] load error:", e);
            setPosts([]);
        }
    }

    // REGISTER
    async function onRegister(e) {
        e.preventDefault();
        setRMsg("");
        try {
            console.log("[AUTH] register →", rEmail);
            const res = await fetch(`${API_URL}/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: rEmail.trim(), passwordOne: rPwd1, passwordTwo: rPwd2 }),
            });
            const data = await safeJson(res);
            console.log("[AUTH] register status", res.status, data);
            if (!res.ok || data.success === false) throw new Error(data.message || `HTTP ${res.status}`);

            if (data.token) localStorage.setItem("blogToken", data.token);

            const u = data.user || {};
            setUser(u);
            localStorage.setItem("blogUser", JSON.stringify(u));

            setRMsg(`Registration OK: ${u.email}`);
            setREmail(""); setRPwd1(""); setRPwd2("");
            loadPosts(order);
        } catch (err) {
            setRMsg(String(err.message || err));
        }
    }

    // LOGIN
    async function onLogin(e) {
        e.preventDefault();
        setLMsg("");
        try {
            console.log("[AUTH] login →", lEmail);
            const res = await fetch(`${API_URL}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: lEmail.trim(), password: lPwd }),
            });
            const data = await safeJson(res);
            console.log("[AUTH] login status", res.status, data);
            if (!res.ok || data.success === false) throw new Error(data.message || `HTTP ${res.status}`);

            if (data.token) localStorage.setItem("blogToken", data.token);

            const u = data.user || {};
            setUser(u);
            localStorage.setItem("blogUser", JSON.stringify(u));
            setLMsg(`Login OK: ${u.email}`);
            setLEmail(""); setLPwd("");
            loadPosts(order);
        } catch (err) {
            setLMsg(String(err.message || err));
        }
    }

    function onLogout() {
        console.log("[AUTH] logout");
        setUser(null);
        localStorage.removeItem("blogUser");
        localStorage.removeItem("blogToken");
        setLikesPost(null);
        setLikesUsers([]);
        setActivePost(null);
        setComments([]);
        loadPosts(order);
    }

    // CREATE
    async function onCreate(e) {
        e.preventDefault();
        setCMsg("");
        try {
            console.log("[POST] create →", { title, imageUrl });
            const res = await fetch(`${API_URL}/posts`, {
                method: "POST",
                headers: { "Content-Type": "application/json", ...authHeaders() },
                body: JSON.stringify({
                    title: title.trim(),
                    image_url: imageUrl.trim(),
                    description: description.trim(),
                }),
            });
            const data = await safeJson(res);
            console.log("[POST] create status", res.status, data);
            if (!res.ok || data.success === false) throw new Error(data.message || `HTTP ${res.status}`);
            setCMsg("Post created");
            clearForm();
            loadPosts(order);
        } catch (err) {
            setCMsg(String(err.message || err));
        }
    }

    // EDIT – pradėti
    function beginEdit(p) {
        setEditPost(p);
        setTitle(p.title || "");
        setImageUrl(p.image_url || "");
        setDescription(p.description || "");
        setCMsg("");
        setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
    }

    // EDIT – išsaugoti
    async function onUpdate(e) {
        e.preventDefault();
        if (!editPost) return;
        setCMsg("");
        try {
            console.log("[POST] update →", editPost.id);
            const res = await fetch(`${API_URL}/posts/${editPost.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", ...authHeaders() },
                body: JSON.stringify({
                    title: title.trim(),
                    image_url: imageUrl.trim(),
                    description: description.trim(),
                }),
            });
            const data = await safeJson(res);
            console.log("[POST] update status", res.status, data);
            if (!res.ok || data.success === false) throw new Error(data.message || `HTTP ${res.status}`);
            setCMsg("Post updated");
            cancelEdit();
            loadPosts(order);
        } catch (err) {
            setCMsg(String(err.message || err));
        }
    }

    function cancelEdit() { setEditPost(null); clearForm(); }
    function clearForm() { setTitle(""); setImageUrl(""); setDescription(""); }

    // DELETE
    async function handleDelete(p) {
        if (!window.confirm("Delete post?")) return;
        try {
            console.log("[POST] delete →", p.id);
            const res = await fetch(`${API_URL}/posts/${p.id}`, {
                method: "DELETE",
                headers: { ...authHeaders() },
            });
            const data = await safeJson(res);
            console.log("[POST] delete status", res.status, data);
            if (!res.ok || data.success === false) throw new Error(data.message || `HTTP ${res.status}`);
            if (editPost && editPost.id === p.id) cancelEdit();
            loadPosts(order);
        } catch (e) {
            alert(String(e.message || e));
        }
    }

    // LIKE/UNLIKE – toggleris iš <Post/>
    async function handleToggleLike(p, isLiked) {
        if (!getToken()) {
            console.warn("[LIKE] missing token – need login");
            alert("Please login to like posts.");
            return;
        }
        const method = isLiked ? "DELETE" : "POST";
        const url = `${API_URL}/posts/${p.id}/like`;
        console.log("[LIKE] toggle →", { id: p.id, isLiked, method });

        try {
            const res = await fetch(url, { method, headers: { ...authHeaders() } });
            const data = await safeJson(res);
            console.log("[LIKE] toggle status", res.status, data);
            if (!res.ok || data.success === false) throw new Error(data.message || `HTTP ${res.status}`);

            const updated = data.post || {};
            setPosts((prev) =>
                prev.map((pp) =>
                    pp.id === p.id
                        ? {
                            ...pp,
                            likes_count: typeof updated.likes_count === "number" ? updated.likes_count : pp.likes_count,
                            is_liked: typeof updated.is_liked === "boolean" ? updated.is_liked : !isLiked,
                            likes: Array.isArray(updated.likes) ? updated.likes : pp.likes,
                        }
                        : pp
                )
            );
        } catch (e) {
            console.error("[LIKE] toggle error:", e);
            alert(String(e.message || e));
        }
    }

    // -------- COMMENTS: užkrova & siuntimas --------

    // kai atidarom postą – užkraunam komentarus
    useEffect(() => {
        if (!activePost?.id) {
            setComments([]);
            setCommentsError("");
            setNewComment("");
            return;
        }
        loadComments(activePost.id);
    }, [activePost?.id]);

    async function loadComments(id) {
        try {
            console.log("[COMMENTS] load for", id);
            setCommentsLoading(true);
            setCommentsError("");
            const res = await fetch(`${API_URL}/posts/${id}/comments`, { headers: { ...authHeaders() } });
            const data = await safeJson(res);
            console.log("[COMMENTS] list status", res.status, data);
            if (!res.ok || data.success === false) throw new Error(data.message || `HTTP ${res.status}`);
            const arr = Array.isArray(data.comments) ? data.comments : [];

            // 🔽 nauja: newest-first
            const sorted = arr.slice().sort((a, b) => {
                const ta = new Date(a.created_at || a.createdAt || 0).getTime();
                const tb = new Date(b.created_at || b.createdAt || 0).getTime();
                return tb - ta;
            });

            setComments(sorted);
        } catch (e) {
            console.error("[COMMENTS] list error:", e);
            setComments([]);
            setCommentsError(e.message || "Fetch error");
        } finally {
            setCommentsLoading(false);
        }
    }

    async function addComment(e) {
        e.preventDefault();
        if (!activePost?.id) return;
        const text = newComment.trim();
        if (!text) return;
        if (!getToken()) {
            alert("Please login to comment.");
            return;
        }
        try {
            console.log("[COMMENTS] add →", { id: activePost.id, text });
            const res = await fetch(`${API_URL}/posts/${activePost.id}/comments`, {
                method: "POST",
                headers: { "Content-Type": "application/json", ...authHeaders() },
                body: JSON.stringify({ text }),
            });
            const data = await safeJson(res);
            console.log("[COMMENTS] add status", res.status, data);
            if (!res.ok || data.success === false) throw new Error(data.message || `HTTP ${res.status}`);

            const added = data.comment;

            // 🔽 nauja: į viršų (newest-first)
            setComments((prev) => [added, ...prev]);
            setNewComment("");

            // atnaujinam skaitliuką kortelėje
            setPosts((prev) =>
                prev.map((pp) =>
                    pp.id === activePost.id
                        ? { ...pp, comments_count: (pp.comments_count || 0) + 1 }
                        : pp
                )
            );
        } catch (e) {
            console.error("[COMMENTS] add error:", e);
            alert(String(e.message || e));
        }
    }

    // LIKES – parodyti kas palaikino
    async function handleShowLikes(p) {
        console.log("[LIKES] open modal for post", p.id);
        setLikesPost(p);
        setLikesUsers([]);
        setLikesError("");
        setLikesLoading(true);
        try {
            const res = await fetch(`${API_URL}/posts/${p.id}/likes`, { headers: { ...authHeaders() } });
            const data = await safeJson(res);
            console.log("[LIKES] list status", res.status, data);
            if (!res.ok || data.success === false) throw new Error(data.message || `HTTP ${res.status}`);
            const arr = Array.isArray(data.users) ? data.users : [];
            setLikesUsers(arr);
        } catch (e) {
            console.error("[LIKES] list error:", e);
            setLikesError(e.message || "Fetch error");
        } finally {
            setLikesLoading(false);
        }
    }
    function closeLikes() {
        setLikesPost(null);
        setLikesUsers([]);
        setLikesError("");
        setLikesLoading(false);
    }

    // gali redaguoti?
    const canEditById = useMemo(() => {
        const email = user?.email || "";
        return (p) => !!email && p?.user_email === email;
    }, [user]);

    // matomas sąrašas
    const visiblePosts = useMemo(() => {
        const arr = Array.isArray(posts) ? posts : [];
        const filtered = onlyAuthor?.email ? arr.filter((p) => p && p.user_email === onlyAuthor.email) : arr;
        return filtered.filter(Boolean);
    }, [posts, onlyAuthor]);

    return (
        <div className={`page ${styles.page || ""}`}>
            <h1 className={styles.h1}>Blog</h1>

            <div className={styles.topbar}>
                <div className={styles.sort}>
                    <span>Sort by time:</span>
                    <select className={styles.select} value={order} onChange={(e) => setOrder(e.target.value)}>
                        <option value="desc">Latest → Oldest</option>
                        <option value="asc">Oldest → Latest</option>
                    </select>
                </div>

                {onlyAuthor?.name && (
                    <div className={styles.filterBadge}>
                        Showing posts by <strong>{onlyAuthor.name}</strong>{" "}
                        <button className="btn" onClick={() => setOnlyAuthor(null)}>Clear</button>
                    </div>
                )}

                {user && (
                    <div className={styles.userBox}>
                        <span className={styles.userName}>{user.userName || user.email}</span>
                        <button className="btn" onClick={onLogout}>Logout</button>
                    </div>
                )}
            </div>

            {/* AUTH blokas – kai NEprisijungęs */}
            {!user && (
                <div
                    className={styles.authGrid || ""}
                    style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", margin: "16px 0" }}
                >
                    {/* Register */}
                    <form onSubmit={onRegister} className={styles.editForm || ""}>
                        <h3 className={styles.formTitle || ""}>Register</h3>
                        <input className={styles.input || ""} placeholder="Email" value={rEmail} onChange={(e) => setREmail(e.target.value)} />
                        <input className={styles.input || ""} type="password" placeholder="Password" value={rPwd1} onChange={(e) => setRPwd1(e.target.value)} />
                        <input className={styles.input || ""} type="password" placeholder="Repeat password" value={rPwd2} onChange={(e) => setRPwd2(e.target.value)} />
                        <div className={styles.formActions || ""}>
                            <button className="btn" type="submit">Register</button>
                        </div>
                        {rMsg && <div className={styles.msg + " " + (/ok|registration ok/i.test(rMsg) ? (styles.ok || "") : (styles.err || ""))}>{rMsg}</div>}
                    </form>

                    {/* Login */}
                    <form onSubmit={onLogin} className={styles.editForm || ""}>
                        <h3 className={styles.formTitle || ""}>Login</h3>
                        <input className={styles.input || ""} placeholder="Email or username" value={lEmail} onChange={(e) => setLEmail(e.target.value)} />
                        <input className={styles.input || ""} type="password" placeholder="Password" value={lPwd} onChange={(e) => setLPwd(e.target.value)} />
                        <div className={styles.formActions || ""}>
                            <button className="btn" type="submit">Login</button>
                        </div>
                        {lMsg && <div className={styles.msg + " " + (/ok|login ok/i.test(lMsg) ? (styles.ok || "") : (styles.err || ""))}>{lMsg}</div>}
                    </form>
                </div>
            )}

            {/* GRID */}
            <div className="grid">
                {visiblePosts.map((p) => (
                    <Post
                        key={p.id}
                        p={p}
                        canEdit={canEditById(p)}
                        onView={setActivePost}              // atidarom modalą (ir komentarus)
                        onEdit={beginEdit}
                        onDelete={handleDelete}
                        onAuthor={(pp) => setOnlyAuthor({ email: pp.user_email, name: pp.user_name || pp.user_email })}
                        onToggleLike={handleToggleLike}
                        onShowLikes={handleShowLikes}
                        currentUserId={user?.id}
                    />
                ))}
            </div>

            <hr className={styles.hr} />
            <div ref={formRef} />
            <h3 className={styles.formTitle}>{editPost ? "Edit post" : "Create post"}</h3>

            <form onSubmit={editPost ? onUpdate : onCreate} className={styles.editForm}>
                <input className={styles.input} placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
                <input className={styles.input} placeholder="Image URL" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
                <textarea className={styles.textarea} placeholder="Description" rows={5} value={description} onChange={(e) => setDescription(e.target.value)} />

                <div className={styles.formActions}>
                    <button className="btn" type="submit">{editPost ? "Save" : "Create"}</button>
                    {editPost && <button type="button" className="btn" onClick={cancelEdit}>Cancel</button>}
                </div>

                {cMsg && <div className={styles.msg + " " + (/(created|updated)/i.test(cMsg) ? styles.ok : styles.err)}>{cMsg}</div>}
            </form>

            {/* SINGLE POST MODAL su KOMENTARAIS */}
            {activePost && (
                <PostModal onClose={() => setActivePost(null)}>
                    <h3 className={styles.modalTitle}>{activePost.title}</h3>
                    <img src={activePost.image_url} alt="" className={styles.modalImg} />
                    <p className={styles.modalText}>{activePost.description}</p>
                    <small className={styles.modalMeta}>
                        {new Date(activePost.created_at).toLocaleString()} • {activePost.user_name || activePost.user_email}
                    </small>

                    <hr className={styles.hr} />

                    <h4 style={{ marginTop: 8, marginBottom: 8 }}>Comments</h4>

                    {/* Add comment form (tik prisijungus) */}
                    {user ? (
                        <form onSubmit={addComment} style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                            <input
                                className={styles.input}
                                placeholder="Write a comment…"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                            />
                            <button className="btn" type="submit">Add</button>
                        </form>
                    ) : (
                        <div className="muted" style={{ marginBottom: 8 }}>Login to comment.</div>
                    )}

                    {/* Comments list */}
                    {commentsLoading && <p className={styles.modalText}>Loading…</p>}
                    {commentsError && <p className={styles.modalText} style={{ color: "crimson" }}>{commentsError}</p>}
                    {!commentsLoading && !commentsError && (
                        <div style={{ display: "grid", gap: 8 }}>
                            {comments.length === 0 ? (
                                <div className="muted">No comments yet.</div>
                            ) : (
                                comments.map((c) => (
                                    <div key={c.id || c._id || c.created_at} className="card" style={{ padding: 12 }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                                            <strong>{c.user_name || c.user || "user"}</strong>
                                            <small className="muted">
                                                {c.created_at ? new Date(c.created_at).toLocaleString() : ""}
                                            </small>
                                        </div>
                                        <div style={{ whiteSpace: "pre-wrap" }}>{c.text || c.comment || ""}</div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </PostModal>
            )}

            {/* Likes modal */}
            {likesPost && (
                <PostModal onClose={closeLikes}>
                    <h3 className={styles.modalTitle}>{"\u2665"} {likesUsers.length}</h3>
                    {likesLoading && <p className={styles.modalText}>Loading…</p>}
                    {likesError && <p className={styles.modalText} style={{ color: "crimson" }}>{likesError}</p>}
                    {!likesLoading && !likesError && (
                        <>
                            {likesUsers.length === 0 ? (
                                <p className={styles.modalText}>—</p>
                            ) : (
                                <ul style={{ paddingLeft: 16, lineHeight: 1.6 }}>
                                    {likesUsers.map((u) => (
                                        <li key={u.id}>
                                            <strong>{u.username}</strong>
                                            {u.email ? <span className="muted"> • {u.email}</span> : null}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </>
                    )}
                </PostModal>
            )}
        </div>
    );
}
