import axios from "axios";

export default ({ req }) => {

    if( typeof window === 'undefined') {
        // we are on the server
        // full domain should be used
  
        // headers: {
        //     Host: 'ticketing.dev'
        // }

        return axios.create({
            baseURL: 'http://ingress-nginx-controller.ingress-nginx.svc.cluster.local',
            headers: req.headers
        });
    } else {
        return axios.create({
            baseURL: '/'
        });
    }
};