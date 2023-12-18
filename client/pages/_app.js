import 'bootstrap/dist/css/bootstrap.css';
import buildClient from "../api/build-client";
import Header from '../component/header';

const AppComponent = ({ Component, pageProps, currentUser }) => {
    return <div>
            <Header currentUser={currentUser}/>
            <div className='container'>
                <Component currentUser={currentUser} {...pageProps} />
            </div>
        </div>
};

AppComponent.getInitialProps = async (appContext) => {

    const client = buildClient(appContext.ctx);
    const { data } = await client.get('/api/users/currentuser');

    let pageProps = {};
    if (appContext.Component.getInitialProps) {
        // running the function of sub page even if it not defined
        // it won't be executed now
        pageProps = await appContext.Component.getInitialProps(appContext.ctx, client, data.currentUser);
    }

    return {
        pageProps,
        ...data
        //currentUser: data.currentUser
    };
};

export default AppComponent;