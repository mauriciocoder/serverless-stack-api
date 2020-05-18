import * as dynamodb from "../../utils/dynamodb";
import { success, failure } from "../../utils/http";

export async function main(event, context) {
  const params = {
    TableName: process.env.tableName,
    // 'KeyConditionExpression' defines the condition for the query
    // - 'userId = :userId': only return items with matching 'userId'
    //   partition key
    // 'ExpressionAttributeValues' defines the value in the condition
    // - ':userId': defines 'userId' to be Identity Pool identity id
    //   of the authenticated user
    KeyConditionExpression: "userId = :userId",
    ExpressionAttributeValues: {
      ":userId": event.requestContext.identity.cognitoIdentityId
    }
  };

  /**
   * Compare in descending order of Date
   * @param {Date} item1
   * @param {Date} item2
   */
  function compareCreatedAt(item1, item2) {
    return item2.createdAt - item1.createdAt;
  }

  try {
    const result = await dynamodb.call("query", params);
    // Return the matching list of items in response body
    return success(result.Items.sort(compareCreatedAt));
  } catch (e) {
    return failure({ status: false });
  }
}