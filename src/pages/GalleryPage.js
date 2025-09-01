import { useEffect, useMemo, useState } from "react";

const PAGE_SIZE = 50;   // 50 nuotraukų per puslapį
const WINDOW = 5;       // kiek numerių rodyti aplink aktyvų

export default function GalleryPage() {
    const [page, setPage] = useState(1);
    const [imgs, setImgs] = useState([]);
    const [status, setStatus] = useState("idle");
    const [error, setError] = useState(null);

    useEffect(() => {
        let alive = true;
        setStatus("loading");
        fetch(`https://picsum.photos/v2/list?page=${page}&limit=${PAGE_SIZE}`)
            .then((r) => {
                if (!r.ok) throw new Error(`HTTP ${r.status}`);
                return r.json();
            })
            .then((data) => {
                if (!alive) return;
                setImgs(data);
                setStatus("success");
            })
            .catch((e) => {
                if (!alive) return;
                setError(e.message);
                setStatus("error");
            });
        return () => { alive = false; };
    }, [page]);

    const pagesToShow = useMemo(() => {
        // slankus langas aplink aktyvų puslapį
        const half = Math.floor(WINDOW / 2);
        const start = Math.max(1, page - half);
        const arr = [];
        for (let p = start; p < start + WINDOW; p++) {
            if (p >= 1) arr.push(p);
        }
        return arr;
    }, [page]);

    if (status === "loading") {
        return (
            <main className="page gallery">
                <h1>Gallery</h1>
                <p>Loading photos…</p>
            </main>
        );
    }

    if (status === "error") {
        return (
            <main className="page gallery">
                <h1>Gallery</h1>
                <p>Failed to load photos: {error}</p>
            </main>
        );
    }

    return (
        <main className="page gallery">
            <h1>Gallery</h1>

            <section className="grid gallery-grid">
                {imgs.map((d) => {
                    const thumb = `https://picsum.photos/id/${d.id}/600/400`;
                    return (
                        <figure className="card img-card" key={d.id} title={`by ${d.author}`}>
                            <img src={thumb} alt={`Photo by ${d.author}`} loading="lazy" />
                            <figcaption className="caption" style={{display:"flex",justifyContent:"space-between",padding:"8px 10px"}}>
                                <span className="author">{d.author}</span>
                                <a href={d.download_url} target="_blank" rel="noreferrer">HD</a>
                            </figcaption>
                        </figure>
                    );
                })}
            </section>

            {/* PAGINATION */}
            <nav className="pager" aria-label="Pagination"
                 style={{display:"flex",gap:8,alignItems:"center",justifyContent:"center",margin:"20px 0"}}>
                <button
                    className="btn"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    aria-label="Previous page"
                >
                    ‹
                </button>

                {/* pirmas + kairysis daugtaškis */}
                {page > 3 && (
                    <>
                        <button className={`btn ${page === 1 ? "primary" : ""}`} onClick={() => setPage(1)}>1</button>
                        {page > 4 && <span className="muted" aria-hidden="true">…</span>}
                    </>
                )}

                {pagesToShow.map((p) => (
                    <button
                        key={p}
                        className={`btn ${p === page ? "primary" : ""}`}
                        onClick={() => setPage(p)}
                        aria-current={p === page ? "page" : undefined}
                    >
                        {p}
                    </button>
                ))}

                {/* dešinysis daugtaškis (galimybės) */}
                <span className="muted" aria-hidden="true">…</span>

                <button
                    className="btn"
                    onClick={() => setPage((p) => p + 1)}
                    aria-label="Next page"
                >
                    ›
                </button>
            </nav>
        </main>
    );
}
