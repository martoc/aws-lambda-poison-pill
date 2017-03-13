var debug = false;
var region = process.env["AWS_REGION"];

function handleResult(err, data) {
  if (err) {
    console.log(err, err.stack); // an error occurred
  } else {
    console.log(data);           // successful response
  }
}

function terminate(instances) {
  var params = {
    InstanceIds: instances
  };
  console.log("Terminating " + instances.length + " instance(s)");
  ec2.terminateInstances(params, handleResult);
}

exports.handler = (event, context, callback) => {
  if (!region || region === null || region === "") {
    region = "us-east-1";
    console.log("AWS Lambda using default region = " + region);
  }
  console.log("Input: ", event)
  var tagName = event.tag_name;
  var tagValue = event.tag_value;
  var AWS = require("aws-sdk");
  AWS.config.update({
    ec2: "2016-11-15",
    autoscaling: "2011-01-01",
    region: region
  });
  var ec2 = new AWS.EC2();
  var autoscaling = new AWS.AutoScaling();

  var params = {
    DryRun: false,
    Filters: [
      {
        Name: "tag:" + tagName,
        Values: [
          tagValue
        ]
      },
      {
        Name: "instance-state-name",
        Values: [
          "running",
          "stopped"
        ]
      }
    ]
  };
  ec2.describeInstances(params, function(err, data) {
    if (err) {
        console.log(err, err.stack); // an error occurred
    } else {
        console.log("DescribeInstances Result: ", data); // successful response
        var instances = [];
        for (var i = 0; i < data.Reservations.length; i++) {
          for (var j = 0; j < data.Reservations[i].Instances.length; j++) {
            var instanceId = data.Reservations[i].Instances[j].InstanceId;
            console.log("Adding " + instanceId + " to termination list");
            instances.push(instanceId);
          }
        }
        terminate(instances);
    }
  });
  callback(null, "Done");
};
