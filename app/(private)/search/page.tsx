import MoviesGrid from "@/app/components/movies-grid.component";
import MoviesSearchBar from "@/app/components/search-bar.component";
import { MovieService } from "@/app/services/movie.service";
import { SearchParamsPromise } from "@/lib/models/general.model";
import { redirect } from "next/navigation";

export default async function Search({
  searchParams,
}: {
  searchParams?: SearchParamsPromise;
}) {
  const params = await searchParams;

  if (!params) {
    return redirect("/");
  }

  const page: string = (params["page"] as string) || "1";
  const searchValue: string = (params["s"] as string) || "";

  const searchResult = await new MovieService().search(
    searchValue,
    parseInt(page)
  );

  if (!searchResult.success) {
    return redirect("/");
  }

  const movies = searchResult.data!.results;

  return (
    <div className="p-10">
      <MoviesSearchBar />

      <h2 className="text-xl mb-2">
        Results for "<i>{searchValue}</i>"
      </h2>

      <MoviesGrid movies={movies} />
    </div>
  );
}
