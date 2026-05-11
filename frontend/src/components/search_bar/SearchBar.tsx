import "./searchBar.css";

type SearchBarProps = {
    search: string;
    setSearch: (value: string) => void;
};

export default function SearchBar({
    search,
    setSearch
}: SearchBarProps) {

    return (
        <input
            className="search-input"
            type="text"
            placeholder="🔍 Szukaj..."
            value={search}
            onChange={(e) =>
                setSearch(e.target.value)
            }
        />
    );
}