import MoviesGrid from "@/app/components/movies-grid.component";
import Pagination from "@/app/components/pagination/pagination.component";
import MoviesSearchBar from "@/app/components/search-bar.component";
import { MovieService } from "@/app/services/movie.service";
import { auth0 } from "@/lib/auth0";
import { redirect } from "next/navigation";

async function FavoritesView({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const session = await auth0.getSession();

  if (!session) {
    return redirect("/auth/login");
  }

  const params = (await searchParams) as any;
  const page = params["page"] || "1";

  const favoritesResult = await new MovieService().getUserFavoritesPaginated(
    session!.user.sub,
    parseInt(page)
  );

  if (!favoritesResult.success) {
    return <p>Could not get favorites</p>;
  }

  return (
    <div>
      <MoviesSearchBar />

      <h2 className="text-xl mb-2">Your favorite movies</h2>

      <MoviesGrid type="favorites" movies={favoritesResult.data!.results} />

      <Pagination
        page={favoritesResult.data!.page}
        pageSize={favoritesResult.data!.pageSize}
        totalResults={favoritesResult.data!.totalResults}
        path="/favorites"
      />
    </div>
  );
}

export default FavoritesView;
