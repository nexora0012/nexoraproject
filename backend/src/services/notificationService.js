const Notification=require(
'../models/Notification'
);

const sendNotification=async({

user,
title,
message,
type,
action='',
metadata={}

})=>{

return Notification.create({

user,
title,
message,
type,
action,
metadata

});

};

module.exports={
sendNotification
};