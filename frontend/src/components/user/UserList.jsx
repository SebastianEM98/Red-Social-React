import React from 'react'
import defaultAvatar from '../../assets/img/user.png'
import { Global } from '../../helpers/Global'
import useAuth from '../../hooks/useAuth'
import { Link } from 'react-router-dom'
import ReactTimeAgo from 'react-time-ago'

export const UserList = ({ users, getUsers, following, setFollowing, page, setPage, moreUsers, loading }) => {

    const { auth } = useAuth();


    const nextPage = () => {
        let next = page + 1;
        setPage(next);
        getUsers(next);
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
            setFollowing([...following, userId]);
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
            let filteredFollowings = following.filter(followingUserId => userId !== followingUserId);
            setFollowing(filteredFollowings);
        }
    }


    return (
        <>
            <div className="content__posts">

                {users.map(user => {

                    return (
                        <article className="posts__post" key={user._id}>

                            <div className="post__container">

                                <div className="post__image-user">
                                    <Link to={"/social/perfil/" + user._id} className="post__image-link">
                                        {user.avatar != "default.png" ?
                                            <img src={Global.url + "/user/avatar/" + user.avatar} className="post__user-image" alt="Foto de perfil" />
                                            :
                                            <img src={defaultAvatar} className="post__user-image" alt="Foto de perfil" />
                                        }
                                    </Link>
                                </div>

                                <div className="post__body">

                                    <div className="post__user-info">
                                        <Link to={"/social/perfil/" + user._id} className="user-info__name">{user.name} {user.surname}</Link>
                                        <span className="user-info__divider"> | </span>
                                        <Link to={"/social/perfil/" + user._id} className="user-info__create-date"><ReactTimeAgo date={Date.parse(user.created_at)}/></Link>
                                    </div>

                                    <h4 className="post__content">{user.bio}</h4>

                                </div>

                            </div>

                            {user._id != auth._id &&
                                <div className="post__buttons">
                                    {!following.includes(user._id) && (
                                        <button className="post__button btn-primary" onClick={() => followUser(user._id)}>
                                            Seguir
                                        </button>
                                    )}
                                    &nbsp;
                                    {following.includes(user._id) && (
                                        <button className="post__button btn-delete" onClick={() => unfollowUser(user._id)}>
                                            Dejar de seguir
                                        </button>
                                    )}
                                </div>
                            }
                        </article>
                    )
                })}
            </div>

            {loading ? <div>Cargando...</div> : ""}

            {moreUsers && (
                <div className="content__container-btn">
                    <button className="content__btn-more-post" onClick={nextPage}>
                        Ver mas personas
                    </button>
                </div>
            )}
        </>
    )
}