import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import { Global } from '../../helpers/Global';
import { PostList } from '../post/PostList';


export const Feed = () => {

    const [posts, setPosts] = useState([]);
    const [page, setPage] = useState(1);
    const [morePosts, setMorePosts] = useState(true);

    useEffect(() => {
        getPosts(1, false);
    }, []);


    const getPosts = async (nextPage = 1, showNewPosts = false) => {

        if (showNewPosts) {
            setPosts([]);
            setPage(1);
            nextPage = 1;

        }

        const request = await fetch(Global.url + "/post/feed/" + nextPage, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": localStorage.getItem("token")
            }
        });

        const data = await request.json();

        if (data.status == "success") {

            let newPosts = data.posts;

            if (!showNewPosts && posts.length > 0) {
                newPosts = [...posts, ...data.posts];
            }

            setPosts(newPosts);

            if (!showNewPosts && nextPage >= data.totalPages) {
                setMorePosts(false);
            }
        }
    }


    return (
        <>
            <header className="content__header">
                <h1 className="content__title">Timeline</h1>
                <button className="content__button" onClick={() => getPosts(1, true)}>Mostrar nuevas</button>
            </header>

            <PostList
                posts={posts}
                getPosts={getPosts}
                page={page}
                setPage={setPage}
                morePosts={morePosts}
                setMorePosts={setMorePosts}
            />

            <br />

        </>
    )
}