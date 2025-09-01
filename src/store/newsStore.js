import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export const useStore = create(
    persist(
        (set, get) => ({
            // ... kiti tavo laukai ...

            // --- NEWS state ---
            news: [],
            newsStatus: "idle",
            newsError: null,

            // Favorites ir Likes
            newsFavIds: [],
            newsLikes: {}, // { [postId]: number }

            // Filtravimas/sortavimas
            newsFilter: "all",       // "all" | "fav"
            newsSort: "latest",      // "latest" | "oldest" | "title-az" | "title-za"
            authorFilter: null,      // null arba "username"

            setNewsFilter: (v) => set({ newsFilter: v }),
            setNewsSort: (v) => set({ newsSort: v }),
            setAuthorFilter: (name) => set({ authorFilter: name || null }),

            fetchAllNews: async () => {
                try {
                    set({ newsStatus: "loading", newsError: null });
                    const r = await fetch("http://156.67.83.41:1111/getallposts");
                    if (!r.ok) throw new Error(`HTTP ${r.status}`);
                    const json = await r.json();
                    const posts = json?.data || [];

                    const prevLikes = get().newsLikes || {};
                    const nextLikes = { ...prevLikes };
                    for (const p of posts) {
                        if (nextLikes[p.id] == null) nextLikes[p.id] = Number(p.likes || 0);
                    }

                    set({ news: posts, newsLikes: nextLikes, newsStatus: "success" });
                } catch (e) {
                    set({ newsStatus: "error", newsError: e.message });
                }
            },

            fetchOneNews: async (name, id) => {
                try {
                    const r = await fetch(`http://156.67.83.41:1111/getsinglepost/${encodeURIComponent(name)}/${encodeURIComponent(id)}`);
                    if (!r.ok) throw new Error(`HTTP ${r.status}`);
                    const json = await r.json();
                    const post = json?.data || null;
                    if (post) {
                        const list = get().news || [];
                        const idx = list.findIndex((x) => x.id === post.id);
                        const next = [...list];
                        if (idx === -1) next.unshift(post);
                        else next[idx] = post;

                        const prevLikes = get().newsLikes || {};
                        const nextLikes = { ...prevLikes };
                        if (nextLikes[post.id] == null) nextLikes[post.id] = Number(post.likes || 0);

                        set({ news: next, newsLikes: nextLikes });
                    }
                    return post;
                } catch (e) {
                    set({ newsError: e.message });
                    return null;
                }
            },

            likeNews: (id) => {
                const map = { ...(get().newsLikes || {}) };
                map[id] = Number(map[id] || 0) + 1;
                set({ newsLikes: map });
            },

            toggleFavNews: (id) => {
                const fav = get().newsFavIds || [];
                set({
                    newsFavIds: fav.includes(id) ? fav.filter((x) => x !== id) : [id, ...fav],
                });
            },

            sortedFilteredNews: () => {
                const all = [...(get().news || [])];
                const fav = get().newsFavIds || [];
                const filter = get().newsFilter;
                const sort = get().newsSort;
                const author = get().authorFilter;

                let rows = all;

                if (author) rows = rows.filter((p) => p.username === author);
                if (filter === "fav") rows = rows.filter((p) => fav.includes(p.id));

                switch (sort) {
                    case "oldest":
                        rows.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
                        break;
                    case "title-az":
                        rows.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
                        break;
                    case "title-za":
                        rows.sort((a, b) => (b.title || "").localeCompare(a.title || ""));
                        break;
                    default:
                        rows.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
                }
                return rows;
            },

            // auth (palik kaip pas tave, čia tik šablonas)
            newsUser: null,
            newsLogin: (user) => set({ newsUser: user }),
            newsLogout: () => set({ newsUser: null }),
        }),
        {
            name: "app-items-store",
            storage: createJSONStorage(() => localStorage),
            partialize: (s) => ({
                news: s.news,
                newsLikes: s.newsLikes,
                newsFavIds: s.newsFavIds,
                newsUser: s.newsUser,
                authorFilter: s.authorFilter,
                newsFilter: s.newsFilter,
                newsSort: s.newsSort,

            }),

        }
    )
);
console.log(useStore);
