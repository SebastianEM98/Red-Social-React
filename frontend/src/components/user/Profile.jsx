import React, { useEffect, useState } from 'react'
import defaultAvatar from '../../assets/img/user.png'
import { GetProfile } from '../../helpers/GetProfile';
import { Link, useParams } from 'react-router-dom';
import { Global } from '../../helpers/Global';
import useAuth from '../../hooks/useAuth';
import { PostList } from '../post/PostList';

export const Profile = () => {

    const { auth } = useAuth();
    const [user, setUser] = useState({});
    const [counters, setCounters] = useState({});
    const [iFollow, setIFollow] = useState(false);
    const [posts, setPosts] = useState([]);
    const [page, setPage] = useState(1);
    const [morePosts, setMorePosts] = useState(true);

    const params = useParams();

    useEffect(() => {
        getDataUser();
        getCounters();
        getPosts(1, true);
    }, [params.userId]);


    const getDataUser = async () => {
        let dataUser = await GetProfile(params.userId, setUser);

        if (dataUser.following && dataUser.following._id) setIFollow(true);
    }

    const getCounters = async () => {

        const request = await fetch(Global.url + "/user/counters/" + params.userId, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": localStorage.getItem("token")
            }
        });

        const data = await request.json();

        if (data.status == "success") {
            setCounters(data);
        }
    }

    const followUser = async (userId) => {

        const request = await fetch(Global.url + "/follow/save", {
            method: "POST",
            body: JSON.stringify({ followed: userId }),
            headers: {
                "Content-Type": "application/json",
                "Authorization": localStorage.getItem("token")
            }
        });

        const data = await request.json();

        if (data.status == "success") {
            setIFollow(true);
        }
    }

    const unfollowUser = async (userId) => {

        const request = await fetch(Global.url + "/follow/unfollow/" + userId, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": localStorage.getItem("token")
            }
        });

        const data = await request.json();

        if (data.status == "success") {
            setIFollow(false);
        }
    }

    const getPosts = async (nextPage = 1, newProfile = false) => {
        const request = await fetch(Global.url + "/post/user/" + params.userId + "/" + nextPage, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": localStorage.getItem("token")
            }
        });

        const data = await request.json();

        if (data.status == "success") {

            let newPosts = data.posts;

            if (!newProfile && posts.length > 0) {
                newPosts = [...posts, ...data.posts];
            }

            if (newProfile) {
                newPosts = data.posts;
                setMorePosts(true);
                setPage(1);
            }

            setPosts(newPosts);

            if (nextPage >= data.totalPages) {
                setMorePosts(false);
            }
        }
    }


    return (
        <>
            <header className="aside__profile-info">

                <div className="profile-info__general-info">
                    <div className="general-info__container-avatar">
                        {user.avatar != "default.png" ?
                            <img src={Global.url + "/user/avatar/" + user.avatar} className="container-avatar__img" alt="Foto de perfil" />
                            :
                            <img src={defaultAvatar} className="container-avatar__img" alt="Foto de perfil" />
                        }
                    </div>

                    <div className="general-info__container-names">
                        <div className="container-names__name profile">
                            <h1>{user.name} {user.surname}</h1>

                            {user._id != auth._id &&
                                (iFollow ?
                                    <button className="content__button content__button--profile btn-delete" onClick={() => unfollowUser(user._id)}>Dejar de seguir</button>
                                    :
                                    <button className="content__button content__button--profile btn-primary" onClick={() => followUser(user._id)}>Seguir</button>
                                )
                            }
                        </div>
                        <h2 className="container-names__nickname">@{user.nick}</h2>
                        <p>{user.bio}</p>
                    </div>

                </div>

                <div className="profile-info__stats">

                    <div className="stats__following">
                        <Link to={"/social/siguiendo/" + user._id} className="following__link">
                            <span className="following__title">Siguiendo</span>
                            <span className="following__number">{counters.following}</span>
                        </Link>
                    </div>
                    <div className="stats__following">
                        <Link to={"/social/seguidores/" + user._id} className="following__link">
                            <span className="following__title">Seguidores</span>
                            <span className="following__number">{counters.followers}</span>
                        </Link>
                    </div>
                    <div className="stats__following">
                        <Link to={"/social/perfil/" + user._id} className="following__link">
                            <span className="following__title">Publicaciones</span>
                            <span className="following__number">{counters.posts}</span>
                        </Link>
                    </div>
                </div>
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