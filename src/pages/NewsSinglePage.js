import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useStore } from "../store/store";

export default function NewsSinglePage() {
    const { name, id } = useParams();
    const navigate = useNavigate();

    const fetchOne     = useStore((s) => s.fetchOneNews);
    const newsUser     = useStore((s) => s.newsUser);
    const favIds       = useStore((s) => s.newsFavIds) || [];
    const toggleFav    = useStore((s) => s.toggleFavNews);

    const likeNews     = useStore((s) => s.likeNews);
    const unlikeNews   = useStore((s) => s.unlikeNews);
    const getLikes     = useStore((s) => s.getLikesCount);
    const likesUsers   = useStore((s) => s.newsLikesUsers) || {};

    const [post, setPost] = useState(null);

    useEffect(() => {
        let alive = true;
        (async () => {
            const data = await fetchOne?.(name, id);
            if (!alive) return;
            setPost(data);
        })();
        return () => (alive = false);
    }, [name, id, fetchOne]);

    if (!post) return <main className="page news"><p>Loading…</p></main>;

    const likes        = getLikes(post.id);
    const isMine       = newsUser?.name === post.username;
    const isFav        = favIds.includes(post.id);
    const alreadyLiked = newsUser ? (likesUsers[post.id] || []).includes(newsUser.name) : false;

    const onAuthorClick = (e) => {
        e.preventDefault();
        navigate(`/news?author=${encodeURIComponent(post.username)}`);
    };

    return (
        <main className="page news">
            <div className="row" style={{ justifyContent: "space-between", marginBottom: 12 }}>
                <Link to="/news" className="btn">Back</Link>
                <a href={`/news?author=${post.username}`} onClick={onAuthorClick} className="btn">
                    More from {post.username}
                </a>
            </div>

            <div className="news-single">
                <div className="media">
                    <img src={post.image} alt={post.title} />
                </div>

                <div className="body">
                    <h2>{post.title}</h2>
                    <p className="muted">
                        <a href={`/news?author=${post.username}`} onClick={onAuthorClick} className="nav-link" style={{ padding: 0 }}>
                            {post.username}
                        </a>
                        {" · "}{new Date(post.timestamp).toLocaleString()}
                    </p>

                    <p className="desc-full">{post.description}</p>

                    <div className="row" style={{ marginTop: 10, gap: 12, flexWrap: "wrap" }}>
                        {newsUser && !isMine && !alreadyLiked && (
                            <button className="btn" onClick={() => likeNews(post.id)}>
                                Like (<span className="like-count">{likes}</span>)
                            </button>
                        )}
                        {newsUser && !isMine && alreadyLiked && (
                            <button className="btn" onClick={() => unlikeNews(post.id)}>
                                Unlike (<span className="like-count">{likes}</span>)
                            </button>
                        )}
                        {(!newsUser || isMine) && <span className="muted">Likes: {likes}</span>}

                        {!isFav ? (
                            <button className="btn" onClick={() => toggleFav?.(post.id)}>
                                Add to favorites
                            </button>
                        ) : (
                            <button className="btn" onClick={() => toggleFav?.(post.id)}>
                                Remove from favorites
                            </button>
                        )}

                        {isMine && (
                            <Link className="btn" to={`/news/edit/{post.id}`}>Edit</Link>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
