import { createClient } from 'contentful';

//components
import RecipeCard from '../components/RecipeCard';

export async function getStaticProps() {
  /*
  fetching data with Contentful Client
  const client = createClient({
    space: process.env.CONTENTFUL_SPACE_ID,
    accessToken: process.env.CONTENTFUL_ACCESS_TOKEN,
  });

  const res = await client.getEntries({ content_type: 'recipe' });

  return {
    props: {
      recipes: res.items,
    },
    revalidate: 1, // seconds
  };
  */

  const query = JSON.stringify({
    query: `
      query {
        recipeCollection {
        items {
          sys {id}
          title
          slug
          cookingTime
          thumbnail {
              url
              width
              height
            }
          }
        }
      }
    `,
  });

  const options = {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.CONTENTFUL_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: query,
  };

  const URL = `https://graphql.contentful.com/content/v1/spaces/${process.env.CONTENTFUL_SPACE_ID}/environments/master`;

  try {
    const res = await fetch(URL, options);
    const { data } = await res.json();
    const recipes = data.recipeCollection.items;

    return {
      props: {
        recipes,
      },
      revalidate: 1, // seconds
    };
  } catch (error) {
    console.log(error);
  }
}

export default function Recipes({ recipes }) {
  return (
    <div className="recipe-list">
      {recipes.map((recipe) => (
        <RecipeCard key={recipe.sys.id} recipe={recipe} />
      ))}

      <style jsx>{`
        .recipe-list {
          display: grid;
          grid-template-columns: 1fr 1fr;
          grid-gap: 1rem 1rem;
        }
      `}</style>
    </div>
  );
}
