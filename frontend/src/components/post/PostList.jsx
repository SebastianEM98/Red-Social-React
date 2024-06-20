import React from 'react'
import defaultAvatar from '../../assets/img/user.png'
import { Link } from 'react-router-dom'
import { Global } from '../../helpers/Global'
import useAuth from '../../hooks/useAuth'
import ReactTimeAgo from 'react-time-ago'

export const PostList = ({posts, getPosts, page, setPage, morePosts, setMorePosts}) => {

    const { auth } = useAuth();

    const nextPage = () => {
        let next = page + 1;
        setPage(next);
        getPosts(next);
    }

    const deletePost = async (postId) => {
        const request = await fetch(Global.url + "/post/remove/" + postId, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": localStorage.getItem("token")
            }
        });

        const data = await request.json();

        setPage(1);
        setMorePosts(true);
        getPosts(1, true);
    }


    return (
        <>
            <div className="content__posts">

                {posts.map(post => {
                    return (
                        <article className="posts__post" key={post._id}>

                            <div className="post__container">

                                <div className="post__image-user">
                                    <Link to={"/social/perfil/" + post.user._id} className="post__image-link">
                                        {post.user.avatar != "default.png" ?
                                            <img src={Global.url + "/user/avatar/" + post.user.avatar} className="post__user-image" alt="Foto de perfil" />
                                            :
                                            <img src={defaultAvatar} className="post__user-image" alt="Foto de perfil" />
                                        }
                                    </Link>
                                </div>

                                <div className="post__body">

                                    <div className="post__user-info">
                                        <a href="#" className="user-info__name">{post.user.name} {post.user.surname}</a>
                                        <span className="user-info__divider"> | </span>
                                        <a href="#" className="user-info__create-date"><ReactTimeAgo date={Date.parse(post.created_at)}/></a>
                                    </div>

                                    <h4 className="post__content">{post.text}</h4>

                                    {post.file && <img src={Global.url + "/post/img/" + post.file} className="img-post"/>}
                                </div>
                            </div>

                            {auth._id == post.user._id &&
                                <div className="post__buttons">
                                    <button onClick={() => deletePost(post._id)} className="post__button btn-delete ">
                                        <i className="fa-solid fa-trash-can"></i>
                                    </button>
                                </div>
                            }

                        </article>
                    )
                })}
            </div>

            {morePosts &&
                <div className="content__container-btn">
                    <button className="content__btn-more-post" onClick={nextPage}>
                        Ver mas publicaciones
                    </button>
                </div>
            }
        </>
    )
}