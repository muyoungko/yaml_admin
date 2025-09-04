const genEntityId = async function(db){

    let ret = await db.collection('counters').findOneAndUpdate(
        { _id: 'seq' },
        {$inc:{seq:1}},
        {
            new :true,
            upsert:true,
            returnNewDocument:true
        }
    );
    if(!ret?.seq){
        ret = await db.collection('counters').findOneAndUpdate(
            { _id: 'seq' },
            {$inc:{seq:1}},
            {
                new :true,
                upsert:true,
                returnNewDocument:true
            }
        );
    }
    return ret.seq
}

const genEntityIdWithKey = async function(db, key){

    let ret = await db.collection('counters').findOneAndUpdate(
        { _id: key },
        {$inc:{seq:1}},
        {
            new :true,
            upsert:true,
            returnNewDocument:true
        }
    );
    
    if(!ret?.seq){
        ret = await db.collection('counters').findOneAndUpdate(
            { _id: key },
            {$inc:{seq:1}},
            {
                new :true,
                upsert:true,
                returnNewDocument:true
            }
        );
    }
    
    return ret.seq
}

module.exports = {
    genEntityId,
    genEntityIdWithKey
};


