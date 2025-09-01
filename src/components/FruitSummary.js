import { useStore } from "../store/store";

export default function FruitSummary() {
    const apples = useStore((s) => s.apples);
    const bananas = useStore((s) => s.bananas);
    const oranges = useStore((s) => s.oranges);

    return (
        <div className="summary">
            <span>Abaliukai: {apples}</span>
            <span>Bananai: {bananas}</span>
            <span>Lepesinai: {oranges}</span>
        </div>
    );
}
