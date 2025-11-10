import MoviesGrid from "@/app/components/movies-grid.component";
import Pagination from "@/app/components/pagination/pagination.component";
import MoviesSearchBar from "@/app/components/search-bar.component";
import { MovieService } from "@/app/services/movie.service";
import { auth0 } from "@/lib/auth0";
import { SearchParamsPromise } from "@/lib/models/general.model";
import { redirect } from "next/navigation";

export default async function Search({
  searchParams,
}: {
  searchParams?: SearchParamsPromise;
}) {
  const session = await auth0.getSession();
  if (!session) {
    return redirect("/auth/login");
  }
  const params = await searchParams;

  if (!params) {
    return redirect("/");
  }

  const page: string = (params["page"] as string) || "1";
  const searchValue: string = (params["s"] as string) || "";

  const [searchResult, favoritesIdsResult] = await Promise.all([
    new MovieService().search(searchValue, parseInt(page)),
    new MovieService().getUserFavoritesIds(session!.user.sub),
  ]);

  if (!searchResult.success) {
    return redirect("/");
  }

  return (
    <div>
      <MoviesSearchBar />

      <h2 className="text-xl mb-2">
        {searchResult.data!.totalResults} results for "<i>{searchValue}</i>"
      </h2>

      <MoviesGrid
        movies={searchResult.data!.results}
        favoritesIds={favoritesIdsResult.data!}
        type="search"
      />

      <Pagination
        page={searchResult.data!.page}
        pageSize={searchResult.data!.pageSize}
        totalResults={searchResult.data!.totalResults}
        path={"/search"}
        queryParams={{ s: searchValue }}
      />
    </div>
  );
}
