
import React, { useState, useEffect } from 'react';
import Stomp from 'stompjs';
import SockJS from 'sockjs-client';
const CommentsComponent = ({ assignmentId, submissionId }) => {
    const [comments, setComments] = useState([]);
    const [stompClient, setStompClient] = useState(null);
    const [commentText, setCommentText] = useState('');
    const [params, setParams] = useState('');

    useEffect(() => {
        const urlSearchParams = new URLSearchParams(window.location.search);
        const params = Object.fromEntries(urlSearchParams.entries());
        setParams(params);
        console.log(params.test)// This will log an object containing all URL query parameters
    }, []); // The empty array [] as the second argument makes useEffect run only once, similar to componentDidMount in class components



    useEffect(() => {
        const socket = new SockJS('http://localhost:8085/ws');
        const stomp = Stomp.over(socket);
        stomp.connect({}, () => {
            setStompClient(stomp);
            console.log("------------------------------")
            console.log("---------connected------------")
            console.log("------------------------------")
            stomp.subscribe(`/topic/comments/${params.aid}`, (comment) => {
                const newComment = JSON.parse(comment.body);
                setComments(prevComments => [...prevComments, newComment.comment]);
            });
        });

        return () => {
            if (stompClient) {
                stompClient.disconnect();
            }
        };
    }, [params]);

    useEffect(() => {
        console.log(comments)
    }, [comments]);

    const handleSubmitComment = (event) => {
        event.preventDefault();
        const newComment = {

            comment: `${commentText}`,
            assignmentId: params.aid,
            studentId: "sid",
            submissionId: "subid",
            courseId: "vid"

        };
        stompClient.send("/app/comment", {}, JSON.stringify(newComment));
        setCommentText('');
    };

    const handleChange = (event) => {
        setCommentText(event.target.value);
    };


    return (
        <div>
            <h2>Comments</h2>
            <ul>
                {comments?.map((comment, index) => (
                    <li key={index}>
                        <strong>{comment}</strong>
                    </li>
                ))}
            </ul>
            <form onSubmit={handleSubmitComment}>
                <input
                    type="text"
                    placeholder="Enter your comment"
                    value={commentText}
                    onChange={handleChange}
                />
                <button type="submit">Submit</button>
            </form>
        </div>
    );
};
export default CommentsComponent;
