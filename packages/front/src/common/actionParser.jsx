/**
  - type: body
    crud : list
    entity: item
    filter:
        - name: region_id
        value: $arg0
    sort:
        - name: seq
        desc: false
 * @param {*} action 
 * @param {*} args 
 * @returns 
 */

const act = (action, args) => {
    console.log('act', action, args)
    /**
     * navigate to Dynamic List Action with args
     */
    if(action.type === 'body') {
        let { crud, entity, filter, sort } = action
        let url = `/${entity}`
        
    }
    return action
}

export { act }