import { Link, useNavigate } from "react-router-dom";
import { useStore } from "../store/store";

export default function NewsCard({ post }) {
    const navigate   = useNavigate();

    const newsUser   = useStore((s) => s.newsUser);
    const favIds     = useStore((s) => s.newsFavIds) || [];
    const toggleFav  = useStore((s) => s.toggleFavNews);
    const deletePost = useStore((s) => s.deleteNews);

    const likeNews     = useStore((s) => s.likeNews);
    const unlikeNews   = useStore((s) => s.unlikeNews);
    const getLikes     = useStore((s) => s.getLikesCount);
    const likesUsers   = useStore((s) => s.newsLikesUsers) || {};

    const likes        = getLikes(post.id);
    const isMine       = newsUser?.name === post.username;
    const isFav        = favIds.includes(post.id);
    const alreadyLiked = newsUser ? (likesUsers[post.id] || []).includes(newsUser.name) : false;

    const onAuthorClick = (e) => {
        e.preventDefault();
        navigate(`/news?author=${encodeURIComponent(post.username)}`);
    };

    return (
        <article className="news-card card">
            <Link to={`/news/${post.username}/${post.id}`} className="product-media" style={{ textDecoration: "none" }}>
                <img src={post.image} alt={post.title} loading="lazy" style={{ margin: "5px" }} />
            </Link>

            <div className="product-body">
                <h4 className="title">{post.title}</h4>

                <p className="muted" style={{ margin: 0 }}>
                    <a href={`/news?author=${post.username}`} onClick={onAuthorClick} className="nav-link" style={{ padding: 0 }}>
                        {post.username}
                    </a>
                    {" · "}{new Date(post.timestamp).toLocaleDateString()}
                </p>

                <p className="desc" style={{ marginTop: 8 }}>
                    {post.description?.length > 140 ? post.description.slice(0, 140) + "…" : post.description}
                </p>

                <div className="actions" style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
                    {newsUser && !isMine && !alreadyLiked && (
                        <button className="btn" onClick={() => likeNews(post.id)}>
                            Like <span className="like-count">{likes}</span>
                        </button>
                    )}
                    {newsUser && !isMine && alreadyLiked && (
                        <button className="btn" onClick={() => unlikeNews(post.id)}>
                            Unlike <span className="like-count">{likes}</span>
                        </button>
                    )}
                    {(!newsUser || isMine) && <span className="muted">Likes: {likes}</span>}

                    {!isFav ? (
                        <button className="btn" onClick={() => toggleFav(post.id)}>
                            Add to fav.
                        </button>
                    ) : (
                        <button className="btn" onClick={() => toggleFav(post.id)}>
                            Don't fav.
                        </button>
                    )}

                    {isMine && (
                        <>
                            <Link className="btn" to={`/news/edit/${post.id}`}>Edit</Link>
                            <button className="btn" onClick={() => deletePost(post.id)}>Delete</button>
                        </>
                    )}
                </div>
            </div>
        </article>
    );
}
