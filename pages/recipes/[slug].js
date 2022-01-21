import Link from 'next/link';
import Image from 'next/image';

import { createClient } from 'contentful';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';

import Skeleton from '../../components/Skeleton';

// const client = createClient({
//   space: process.env.CONTENTFUL_SPACE_ID,
//   accessToken: process.env.CONTENTFUL_ACCESS_TOKEN,
// });

export async function getStaticPaths() {
  /*
  const res = await client.getEntries({
    content_type: 'recipe',
  });

  const paths = res.items.map((item) => {
    return {
      params: { slug: `${item.fields.slug}` },
    };
  });

  return {
    paths,
    fallback: true,
  };
  */

  const query = JSON.stringify({
    query: `
      query {
        recipeCollection {
        items {
          slug
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

  const res = await fetch(URL, options);
  const { data } = await res.json();

  const paths = data.recipeCollection.items.map((item) => {
    return {
      params: { slug: `${item.slug}` },
    };
  });

  return {
    paths,
    fallback: true,
  };
}

export async function getStaticProps({ params }) {
  /*
  const { items } = await client.getEntries({
    content_type: 'recipe',
    'fields.slug': params.slug,
  });

  if (!items.length) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  return {
    props: {
      recipe: items[0],
    },
    revalidate: 1, // seconds
  };
  */

  const query = JSON.stringify({
    query: `
      query GetRecipe($slug: String!) {
        recipeCollection(where: {
          slug: $slug,
        },
        limit: 1
        ) {
          items {
            title
            cookingTime
            featuredImage {
              url
              width
              height
            }
            method {
              json
            }
            ingredients
            }
          }
      }
    `,
    variables: {
      slug: params.slug,
    },
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

  const res = await fetch(URL, options);
  const { data } = await res.json();

  return {
    props: {
      recipe: data.recipeCollection.items[0],
    },
    revalidate: 1, // seconds
  };
}

export default function RecipeDetails({ recipe }) {
  // fallback page
  if (!recipe) return <Skeleton />;

  // normal rendering
  const { title, cookingTime, featuredImage, method, ingredients } = recipe;

  return (
    <div>
      <div className="banner">
        <Image
          src={featuredImage.url}
          width={featuredImage.width}
          height={featuredImage.height}
        />
        <h2>{title}</h2>
      </div>

      <div className="info">
        <p>Take about {cookingTime} minute to cook</p>
        <h3>Ingredients:</h3>
        {ingredients.map((ingredient, i) => (
          <span key={i}>{ingredient}</span>
        ))}
      </div>

      <div className="method">
        <h3>Method:</h3>
        <div>{documentToReactComponents(method.json)}</div>
      </div>

      <style jsx>{`
        h2,
        h3 {
          text-transform: uppercase;
        }
        .banner h2 {
          margin: 0;
          background: #fff;
          display: inline-block;
          padding: 20px;
          position: relative;
          top: -60px;
          left: -10px;
          transform: rotateZ(-1deg);
          box-shadow: 1px 3px 5px rgba(0, 0, 0, 0.1);
        }
        .info p {
          margin: 0;
        }
        .info span::after {
          content: ', ';
        }
        .info span:last-child::after {
          content: '.';
        }
      `}</style>
    </div>
  );
}
