// The first deployed file must be named main.js and must be placed on the root of the cloud folder.
// The example below shows you how a cloud code function looks like.

// import Parse from 'parse';


//UNCOMMENT THESE TWO FUNCTIONS TEMPORARILY WHEN YOU USE THEM.
//DON'T COMMIT WITH THESE UNCOMMENTED
// Parse.Cloud.define('getSchema', async (request) => {
//   return await Parse.Schema.all();
// });

// Parse.Cloud.define('setSchema', async (request) => {
//   request.params.result.forEach(parseClass => {
//     if (parseClass.className.startsWith('_')) {
//       return;
//     }
//     const classSchema = new Parse.Schema(parseClass.className);

//     for (const [fieldName, fieldOptions] of Object.entries(parseClass.fields)) {
//       const skippedFields = ['ACL', 'objectId', 'createdAt', 'updatedAt'];
//       if (skippedFields.includes(fieldName)) {
//         continue;
//       }
//       let strippedOptions = Object.assign({}, fieldOptions);
//       delete strippedOptions.type;
//       switch (fieldOptions.type) {
//         //   case 'String':
//         //     classSchema.addString(fieldName, fieldOptions);
//         //     break;
//       //   case 'Date':
//       //     classSchema.addString(fieldName, fieldOptions);
//       //     break;
//       //   case 'Object':
//       //     classSchema.addString(fieldName, fieldOptions);
//       //     break;
//       //   case 'Boolean':
//       //     classSchema.addString(fieldName, fieldOptions);
//       //     break;
//       //   case 'File':
//       //     classSchema.addString(fieldName, fieldOptions);
//       //     break;
//       //   case 'Number':
//       //     classSchema.addString(fieldName, fieldOptions);
//       //     break;
//       //   case 'Array':
//       //     classSchema.addString(fieldName, fieldOptions);
//       //     break;
//         case 'Pointer':
//           classSchema.addPointer(fieldName, fieldOptions.targetClass, strippedOptions);
//           break;
//         case 'Relation':
//           classSchema.addRelation(fieldName, fieldOptions.targetClass, strippedOptions);
//           break;
//         default:
//           classSchema.addField(fieldName, fieldOptions.type, strippedOptions)
//           break;
//       }
//     }

//     classSchema.save();
//   });
// })


Parse.Cloud.define('hello', (request) => {
  return ('Hello world!');
});


// A bit hacky. But didn't work with beforeSaveFile trigger... At least not on Back4App
// TODO: Double check that the request/user is authenticated before cloud functions even get called
Parse.Cloud.define('removeOldPic', (request) => {
  const { user } = request;
  if (user) {
    const avatar = user.get('avatarImage'); // this is a Parse.File that is already saved to the user object
    if (avatar) {
      console.log('destroying old picture: ', avatar.name, ' for user: ', user.id);
      console.log(avatar);
      avatar.destroy({
        useMasterKey: true,

        success: function (result) {
          console.log(result);
        },
        error: function (error) {
          console.error(error.message);
        }

      })




      // let imageUrl = avatar.url();
      // Parse.Cloud.httpRequest({
      //   method: 'DELETE',
      //   url: image.substring(image.lastIndexOf("/") + 1),
      //   headers: {
      //     "X-Parse-Application-Id": "YOUR_APP_ID",
      //     "X-Parse-REST-API-Key": "YOUR_API_KEY"
      //   }
      // });
    }
  }
});




// TODO: Fix so that we handle old pic when user uploads new one!!!!

// require('./beforeSaveFileEvent');
// removing old file on upload
// Parse.Cloud.beforeSaveFile((request) => {
//   const { user } = request;
//   if (user) {
//     /**
//      * @type {Parse.File} the avatar pic
//      */
//     const avatar = user.get('avatarImage'); // this is a Parse.File that is already saved to the user object
//     if (avatar) {
//       console.log('destroying old picture: ', avatar.name, ' for user: ', user.id);
//       avatar.destroy();
//     }
//   }
// });



/* Parse Server 2.x
* Parse.Cloud.define("hello", function(request, response){
* 	response.success("Hello world!");
* });
*/

// To see it working, you only need to call it through SDK or REST API.
// Here is how you have to call it via REST API:

/*
* curl -X POST \
* -H "X-Parse-Application-Id: 48HlASeUVdwO6AVaorpzPh7wBvXPpOo0rBI0OZVq" \
* -H "X-Parse-REST-API-Key: hbGOrY3kvz1DgE2wxeXxqZjgPnVEVphhATHBjefz" \
* -H "Content-Type: application/json" \
* -d "{}" \
* https://parseapi.back4app.com/functions/hello
*/

// If you have set a function in another cloud code file, called "test.js" (for example)
// you need to refer it in your main.js, as you can see below:

/* require("./test.js"); */