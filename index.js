import _ from "lodash"
import base64 from "base-64"
import mixpaneldevdocs from '@api/mixpaneldevdocs';

import config from './projects.json' with { type: "json" };


main()
async function main () {
    let projects = config.projects

    _.forEach(projects, async (project) => {

        let response
        try {
            response = await readLexicon(project)
        } catch (err) {
            console.log(err)
        }

        try {
            writeMetaData(project, response)
        } catch (err) {
            console.log(err)
        }
    })
}

function readLexiconResponse (response){
    //throw error
   
}
async function readLexicon (project) {


    let {secret, id} = project 


    let url = `https://mixpanel.com/api/query/data_definitions/events?project_id=${id}`
    console.log(id)
    console.log(secret)

    try {
        let res = await fetch (url, {headers: new Headers({ "Authorization": `Basic ${base64.encode(`${secret}:`)}`})})
        return res.json()
    } catch (error) {
        return error
    }

}

function writeMetaData (project, response) {
    let {dest, src} = project
    _.forEach(response.results, event => {
        let url = `https://mixpanel.com/project/${project.id}`
        mixpaneldevdocs.trackEvent([{event: "Event Meta Data", properties: {token: project.dest, distinct_id:event.name, time:new Date().getTime(), ...event, src:project.name, srcURL:url}}], {verbose: 1, accept: 'text/plain'})
            .then(({ data }) => console.log(data))
            .catch(err => console.error(err));
    })
}