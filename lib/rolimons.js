import superagent from 'superagent';

let rolimonsDetails = {};
export const getRolimonsDetails = () => rolimonsDetails;

export const refreshRolimonsDetails = () => new Promise(resolve => {
    superagent('GET', 'https://www.rolimons.com/itemapi/itemdetails')
        .set('user-agent', 'roblox items')
        .then(resp => {
            if (!resp.body || !resp.body.items)
                return resolve();

            rolimonsDetails = resp.body.items;
            return resolve(rolimonsDetails);
        })
        .catch(error => {
            if (!error.response)
                console.error(`Failed to fetch rolimon's item details`, error);
            else
                console.error(`Failed to fetch rolimon's item details`, error.response.text, error.status)

            return resolve();
        })
})