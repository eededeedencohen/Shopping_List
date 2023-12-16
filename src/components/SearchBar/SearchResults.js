import React from "react";

function SearchResults({ ResultsProducts }) {
    return (
        <div>
            <h1>Search Results</h1>
            <pre>{JSON.stringify(ResultsProducts, null, 2)}</pre>
        </div>
    )
}