var questionsArr = getJson();
for( var i = 0, len = questionsArr.length; i < len; i++ ){
    console.log(questionsArr[i], db.get());
    db.get().collection('questionbank').insert(questionsArr[i]);
}

function getJson(){
//['Java','.Net','Oracle', 'JavaScript', 'Html5', 'NodeJs', 'ActionScript', 'Objective C', 'Php', 'MongoDb', 'AngularJs', 'Android', 'XML', 'MySql','SqlServer','C#','Selenium', 'Testing', 'Shell Script', 'Linux', 'C++', 'C']
    var tests = ['Java','.Net','Oracle', 'JavaScript', 'Html5', 'NodeJs', 'ActionScript', 'Objective C', 'Php', 'MongoDb', 'AngularJs', 'Android', 'XML', 'MySql','SqlServer','C#','Selenium', 'Testing', 'Shell Script', 'Linux', 'C++', 'C'],
        template = {
            index:0,
            topic: "",
            title: "",
            level:0,
            questions:[]
        },
        finalJson = [],
        index = 0;

    for( var i = 0, len = tests.length; i < len; i++ ){

        var test = tests[i];

        for( var j = 0; j < 3; j++ ) {

            var data = {};

            data.index = index++;
            data.topic = test.replace(/ /g,'').toLowerCase();
            data.title = test;
            data.level = j;
            data.questions = [];
            for( var k = 0; k < 50; k++ ){

                data.questions[k] = {
                    'question' : 'This is a sample question number '+(k+1)+' for test with title '+test,
                    'choices'  : ['Option 1','Option 2', 'Option 3', 'Option 4'],
                    'answer'   : 0,
                    'index'    : k
                };

            }
            finalJson.push(data);
        }

    }

    return finalJson;

}

//db.questionbank.insert({index:58,topic:"ciscostorage",title:"Cisco Storage",level:0})
//db.questionbank.update({index:58},{index:58,topic:"ciscostorage",title:"Cisco Storage",level:0,questions:[]})
//db.questionbank.update({index:58},{$addToSet:{questions:{question:"What is the most commonly used topology by Brocade/Cisco?",choices:["Point to Point","Arbitrated Topology","Switched Fabric","Open Stack"],answer:2,index:1}}})
// db.questionbank.update({index:58},{$addToSet:{questions:{question:"What is Zoning for?",choices:["For Fun","Security and Management","I do not know"],answer:1,index:2}}})
// db.questionbank.update({index:58},{$addToSet:{questions:{question:"What happens if a N port does not do SCR?",choices:["LUNS addition and removal will be unknown","OS will crash","Switch will crash","Nothing will happen"],answer:0,index:3}}})
// db.questionbank.update({index:58},{$addToSet:{questions:{question:"What is the type of end device RSCN sent on Zoneset deactivate?",choices:["Fabric RSCN","Port RSCN","Area RSCN","Domain RSCN"],answer:0,index:4}}})
// db.questionbank.update({index:58},{$addToSet:{questions:{question:"What should HBA do to login to a switch?",choices:["FLOGI","PLOGI","RFT_ID","LS_RJT"],answer:0,index:5}}})
// db.questionbank.update({index:58},{$addToSet:{questions:{question:"What speed uses QSFP modules",choices:["10Gb","16Gb","40GB","4GB"],answer:2,index:6}}})
// db.questionbank.update({index:58},{$addToSet:{questions:{question:"Example of a Primitive?",choices:["LR","FLOGI","PLOGI","ABTS"],answer:0,index:7}}})
// db.questionbank.update({index:58},{$addToSet:{questions:{question:"What is commonly used for Data Replication over different geographic locations?",choices:["FCIP","Tape","FC","VTL"],answer:0,index:8}}})
// db.questionbank.update({index:58},{$addToSet:{questions:{question:"What is CNA?",choices:["HBA+NIC","Dual Port HBA","iSCSI","SCSI"],answer:0,index:9}}})
// db.questionbank.update({index:58},{$addToSet:{questions:{question:"What will happen in case of a Loss of sync for 110ms on a N port?",choices:["Nothing","LR/LRR","Link flap","PLOGI"],answer:2,index:10}}})
//db.questionbank.update({index:58,"questions":{ "question" : "What will happen in case of a Loss of sync for 110ms on a N port?", "choices" : [ "Nothing", "LR/LRR", "Link flap", "PLOGI" ], "answer" : 2, "index" : 10 }},{$set:{"questions.$":{ "question" : "What will happen in case of a Loss of sync for 110ms on a N port?", "choices" : [ "Nothing", "LR/LRR", "Link flap", "PLOGI" ], "answer" : 2, "index" : 0 }}})

//./mongo ds017246.mlab.com:17246/techassesment -u saravanan86 -p knight1!