import React from "react";
import ColorForm from "../components/ColorForm";
import ColorList from "../components/ColorList";

export default function ColorsPage() {
    return (
        <div className="page two-col">
            <ColorForm />
            <ColorList />
        </div>
    );
}
