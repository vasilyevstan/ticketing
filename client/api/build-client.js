import axios from "axios";

export default ({ req }) => {

    if( typeof window === 'undefined') {
        // we are on the server
        // full domain should be used

        // console.log('client base url', process.env.INGRESS_BASE_URL);

        return axios.create({
            baseURL: process.env.INGRESS_BASE_URL,
            headers: req.headers
        });
    } else {
        return axios.create({
            baseURL: '/'
        });
    }
};