import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { newsApi } from "../services/newsApi";

const useStore = create(
    persist(
        (set, get) => ({
            // =================== DEMO ===================
            bears: 0,
            increasePopulation: () => set((s) => ({ bears: s.bears + 1 })),
            removeAllBears: () => set({ bears: 0 }),
            updateBears: (n) => set({ bears: n }),

            apples: 0, bananas: 0, oranges: 0,
            incApple: () => set((s) => ({ apples: s.apples + 1 })),
            incBanana: () => set((s) => ({ bananas: s.bananas + 1 })),
            incOrange: () => set((s) => ({ oranges: s.oranges + 1 })),
            setApple: (v) => set({ apples: Number(v) || 0 }),
            setBanana: (v) => set({ bananas: Number(v) || 0 }),
            setOrange: (v) => set({ oranges: Number(v) || 0 }),

            items: [], nextId: 1,
            addItem: (payload) => {
                const { nextId, items } = get();
                const newItem = { id: nextId, ...payload };
                set({ items: [newItem, ...items], nextId: nextId + 1 });
                return newItem;
            },
            removeItem: (id) => set({ items: get().items.filter((x) => x.id !== id) }),
            getItem: (id) => get().items.find((x) => x.id === id),
            updateItem: (id, patch) =>
                set({ items: get().items.map((x) => (x.id === id ? { ...x, ...patch } : x)) }),
            clearItems: () => set({ items: [], nextId: 1 }),

            // =================== SHOP ===================
            products: [],
            productsStatus: "idle",
            productsError: null,
            async fetchProducts() {
                if (get().productsStatus === "loading") return;
                set({ productsStatus: "loading", productsError: null });
                try {
                    const r = await fetch("https://fakestoreapi.com/products");
                    if (!r.ok) throw new Error(`HTTP ${r.status}`);
                    const data = await r.json();
                    set({ products: data, productsStatus: "success" });
                } catch (e) {
                    set({ productsStatus: "error", productsError: e.message });
                }
            },
            getProductById: (id) => get().products.find((p) => p.id === Number(id)),
            async fetchSingleProduct(id) {
                const r = await fetch(`https://fakestoreapi.com/products/${id}`);
                if (!r.ok) throw new Error(`HTTP ${r.status}`);
                const p = await r.json();
                const exists = get().products.some((x) => x.id === p.id);
                if (!exists) set({ products: [...get().products, p] });
                return p;
            },

            cart: [],
            addToCart: (product, qty = 1) =>
                set((s) => {
                    const id = product.id;
                    const found = s.cart.find((c) => c.id === id);
                    if (found) return { cart: s.cart.map((c) => (c.id === id ? { ...c, qty: c.qty + qty } : c)) };
                    return { cart: [{ id, title: product.title, price: Number(product.price), image: product.image, qty }, ...s.cart] };
                }),
            removeFromCart: (id) => set({ cart: get().cart.filter((c) => c.id !== id) }),
            setCartQty: (id, qty) =>
                set((s) => {
                    const q = Number(qty) || 0;
                    if (q <= 0) return { cart: s.cart.filter((c) => c.id !== id) };
                    return { cart: s.cart.map((c) => (c.id === id ? { ...c, qty: q } : c)) };
                }),
            clearCart: () => set({ cart: [] }),

            // =================== NEWS AUTH ===================
            newsUser: null,        // { name, secretKey }
            newsAuthStatus: "idle",// idle | authed | guest

            async newsRegister({ name, password }) {
                await newsApi.createAccount({ name, passwordOne: password, passwordTwo: password });
                const loginRes = await newsApi.login({ name, password });
                set({ newsUser: { name, secretKey: loginRes.secretKey }, newsAuthStatus: "authed" });
            },
            async newsLogin({ name, password }) {
                const res = await newsApi.login({ name, password });
                set({ newsUser: { name, secretKey: res.secretKey }, newsAuthStatus: "authed" });
            },
            newsLogout() {
                set({ newsUser: null, newsAuthStatus: "guest" });
            },
            newsCheckAuth() {
                const u = get().newsUser;
                set({ newsAuthStatus: u?.secretKey ? "authed" : "guest" });
            },

            // =================== NEWS CRUD ===================
            news: [],
            newsStatus: "idle",
            newsError: null,
            newsFilter: "all",
            newsSort: "latest",

            newsFavIds: [],

            setNewsFilter: (v) => set({ newsFilter: v }),
            setNewsSort:   (v) => set({ newsSort: v }),

            async fetchAllNews() {
                set({ newsStatus: "loading", newsError: null });
                try {
                    const data = await newsApi.getAllPosts();
                    set({ news: data.data || [], newsStatus: "success" });
                } catch (e) {
                    set({ newsStatus: "error", newsError: e.message });
                }
            },

            async fetchUserNews(name) {
                const data = await newsApi.getUserPosts(name);
                set({ news: data.data || [] });
            },

            async fetchOneNews(username, id) {
                const data = await newsApi.getSinglePost(username, id);
                return data.data;
            },

            async createNews({ title, image, description }) {
                const user = get().newsUser;
                if (!user?.secretKey) throw new Error("Not authenticated");
                await newsApi.createPost({ secretKey: user.secretKey, title, image, description });
                await get().fetchAllNews();
            },

            async updateNews({ id, title, image, description }) {
                const user = get().newsUser;
                if (!user?.secretKey) throw new Error("Not authenticated");
                await newsApi.updatePost({ secretKey: user.secretKey, id, title, image, description });
                await get().fetchAllNews();
            },

            async deleteNews(id) {
                const user = get().newsUser;
                if (!user?.secretKey) throw new Error("Not authenticated");
                await newsApi.deletePost({ secretKey: user.secretKey, id });
                set({ news: get().news.filter((p) => p.id !== id) });
            },

            toggleFavNews(id) {
                const setFav = new Set(get().newsFavIds);
                if (setFav.has(id)) setFav.delete(id); else setFav.add(id);
                set({ newsFavIds: Array.from(setFav) });
            },

            // =================== LIKES ===================
            newsLikesUsers: {}, // {postId: [usernames]}
            likeNews(postId) {
                const user = get().newsUser;
                if (!user) return;
                const map = { ...get().newsLikesUsers };
                const current = new Set(map[postId] || []);
                if (!current.has(user.name)) {
                    current.add(user.name);
                    map[postId] = Array.from(current);
                    set({ newsLikesUsers: map });
                }
            },
            unlikeNews(postId) {
                const user = get().newsUser;
                if (!user) return;
                const map = { ...get().newsLikesUsers };
                const current = new Set(map[postId] || []);
                if (current.has(user.name)) {
                    current.delete(user.name);
                    map[postId] = Array.from(current);
                    set({ newsLikesUsers: map });
                }
            },
            getLikesCount(postId) {
                return (get().newsLikesUsers[postId] || []).length;
            },

            // computed
            sortedFilteredNews() {
                const { news, newsFilter, newsFavIds, newsSort } = get();
                let list = [...news];
                if (newsFilter === "fav") list = list.filter(p => newsFavIds.includes(p.id));

                const byDate = (a,b) => (a.timestamp||0) - (b.timestamp||0);
                const byTitle = (a,b) => (a.title||"").localeCompare(b.title||"");
                switch (newsSort) {
                    case "oldest": list.sort(byDate); break;
                    case "title-az": list.sort(byTitle); break;
                    case "title-za": list.sort((a,b)=>byTitle(b,a)); break;
                    default: list.sort((a,b)=>byDate(b,a));
                }
                return list;
            },
        }),
        {
            name: "app-store",
            storage: createJSONStorage(() => localStorage),
            partialize: (s) => ({
                items: s.items, nextId: s.nextId,
                cart: s.cart, products: s.products,
                newsUser: s.newsUser, newsFavIds: s.newsFavIds, newsFilter: s.newsFilter, newsSort: s.newsSort,
                newsLikesUsers: s.newsLikesUsers,
            }),
        }
    )
);

export { useStore };
