import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useStore } from "../store/store";
import CreatePost from "../components/CreatePost";

export default function NewsEditorPage() {
    const { id } = useParams(); // /news/new  -> id = undefined;  /news/edit/:id -> id = "...";

    const fetchOne   = useStore((s) => s.fetchOneNews);
    const newsUser   = useStore((s) => s.newsUser);
    const allNews    = useStore((s) => s.news);

    // pabandome rasti postą lokaliai (kai jau buvom sąraše)
    const localPost = useMemo(
        () => (id ? allNews.find((p) => String(p.id) === String(id)) : null),
        [id, allNews]
    );

    const [post, setPost] = useState(localPost || null);

    useEffect(() => {
        let alive = true;
        // jei redaguojam, bet lokaliai neradom – parsinešam pagal prisijungusio vartotojo vardą
        if (id && !localPost && newsUser?.name) {
            (async () => {
                try {
                    const data = await fetchOne(newsUser.name, id);
                    if (alive) setPost(data);
                } catch {
                    // jei neišėjo – paliekam tuščią, CreatePost pats parodys create formą, jei post=null? (ne – čia redaguojam)
                    if (alive) setPost(null);
                }
            })();
        }
        return () => { alive = false; };
    }, [id, localPost, fetchOne, newsUser]);

    // jei /news/new – post = null (Create režimas)
    // jei /news/edit/:id – post objektas (Edit režimas)
    return <CreatePost post={post} />;
}
