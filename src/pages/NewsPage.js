import { useEffect, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useStore } from "../store/store";
import NewsCard from "../components/NewsCard";

export default function NewsPage() {
    const [params]      = useSearchParams();
    const authorParam   = params.get("author");

    const status        = useStore((s) => s.newsStatus);
    const error         = useStore((s) => s.newsError);
    const fetchAllNews  = useStore((s) => s.fetchAllNews);

    const all           = useStore((s) => s.news) || [];
    const favIds        = useStore((s) => s.newsFavIds) || [];
    const newsFilter    = useStore((s) => s.newsFilter);
    const setNewsFilter = useStore((s) => s.setNewsFilter);
    const newsSort      = useStore((s) => s.newsSort);
    const setNewsSort   = useStore((s) => s.setNewsSort);

    const user          = useStore((s) => s.newsUser);

    useEffect(() => {
        if (status === "idle") fetchAllNews?.();
    }, [status, fetchAllNews]);

    const list = useMemo(() => {
        let rows = [...all];
        if (authorParam) rows = rows.filter(p => p.username === authorParam);
        if (newsFilter === "fav") rows = rows.filter(p => favIds.includes(p.id));

        switch (newsSort) {
            case "oldest": rows.sort((a,b)=>(a.timestamp||0)-(b.timestamp||0)); break;
            case "title-az": rows.sort((a,b)=>(a.title||"").localeCompare(b.title||"")); break;
            case "title-za": rows.sort((a,b)=>(b.title||"").localeCompare(a.title||"")); break;
            default: rows.sort((a,b)=>(b.timestamp||0)-(a.timestamp||0));
        }
        return rows;
    }, [all, favIds, newsFilter, newsSort, authorParam]);

    const favCount = all.filter(p => favIds.includes(p.id)).length;

    return (
        <main className="page news">
            {/* Antraštė + Add post */}
            <div className="page-title-row">
                <h1>News</h1>
                {user?.name && (
                    <Link to="/news/new" className="btn">Add post</Link>
                )}
            </div>

            {/* Tabs + Sort */}
            <div className="summary" style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center" }}>
                <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                    <button className={`btn ${newsFilter === "all" ? "primary" : ""}`} onClick={() => setNewsFilter("all")}>
                        All ({all.length})
                    </button>
                    <button className={`btn ${newsFilter === "fav" ? "primary" : ""}`} onClick={() => setNewsFilter("fav")}>
                        Favorites ({favCount})
                    </button>

                    {authorParam && (
                        <span className="muted" style={{ marginLeft: 10 }}>
              Author: <strong>{authorParam}</strong>{" "}
                            <a className="btn" href="/news">Clear</a>
            </span>
                    )}
                </div>

                <div className="row" style={{ gap: 8 }}>
                    <label htmlFor="news-sort">Sort by:</label>
                    <select
                        id="news-sort"
                        value={newsSort}
                        onChange={(e) => setNewsSort(e.target.value)}
                        style={{ padding: "8px 10px", borderRadius: 10, border: "1px solid #ddd" }}
                    >
                        <option value="latest">Latest</option>
                        <option value="oldest">Oldest</option>
                        <option value="title-az">Title A–Z</option>
                        <option value="title-za">Title Z–A</option>
                    </select>
                </div>
            </div>

            {status === "loading" && <p>Loading…</p>}
            {status === "error" && <p style={{ color: "crimson" }}>{error}</p>}

            <section className="grid">
                {list.map((post) => (
                    <NewsCard key={post.id} post={post} />
                ))}
            </section>
        </main>
    );
}
