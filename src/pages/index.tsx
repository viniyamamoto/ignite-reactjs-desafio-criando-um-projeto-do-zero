import { GetStaticProps } from 'next';

import { getPrismicClient } from '../services/prismic';

import { FiCalendar, FiUser } from 'react-icons/fi';
import { useState } from 'react';
import { parseISO, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Prismic from '@prismicio/client';
import Link from 'next/link';
import Head from 'next/head';

import Header from '../components/Header';



import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';


interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {

  const [posts, setPosts] = useState<Post[]>(postsPagination.results);
  const [nextPage, setNextPage] = useState(postsPagination.next_page);

  function handleNextPage(): void {


    fetch(nextPage)
      .then(res => res.json())
      .then(data => {
        const newPosts = data.results.map(post => {
          return {
            uid: post.uid,
            data: {
              title: post.data.title,
              subtitle: post.data.subtitle,
              author: post.data.author,
            },
            first_publication_date: post.first_publication_date,
          };
        });

        setPosts([...posts, ...newPosts]);
        setNextPage(data.next_page);
      });
  }


  return (
    <>
      <Head>
        <title>Home | spacetraveling</title>
      </Head>
      <main className={commonStyles.container}>
        <article className={styles.content}>
          <Header />
          <section className={styles.posts}>
            {posts.map(post => (
              <Link href={`/post/${post.uid}`} key={post.uid}>
                <a className={styles.post}>
                  <h1>{post.data.title}</h1>
                  <h2>{post.data.subtitle}</h2>
                  <div>
                    <FiCalendar />
                    <time>
                      {format(
                        parseISO(post.first_publication_date),
                        'dd MMM yyyy',
                        {
                          locale: ptBR,
                        }
                      )}
                    </time>
                    <FiUser />
                    <p>
                      {post.data.author}
                    </p>
                  </div>
                </a>
              </Link>
            ))}
          </section>
          {nextPage && (
            <button type="button" onClick={handleNextPage}>
              Carregar mais posts
            </button>
          )}
        </article>
      </main>
    </>
  )
}

export const getStaticProps: GetStaticProps = async ({ preview = false }) => {

  const prismic = getPrismicClient();

  const postsResponse = await prismic.query(
    [Prismic.Predicates.at('document.type', 'posts')],
    {
      pageSize: 1,
      orderings: '[document.last_publication_date desc]',
    }
  );

  const results = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    };
  });

  const postsPagination = {
    next_page: postsResponse.next_page,
    results,
  }

  return {
    props: {
      postsPagination,
      preview,
    },
    revalidate: 60 * 60 * 24,
  };
};