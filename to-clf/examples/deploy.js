module.exports = async function deploy
({
    dryRun = false /* Just print what this will do */,
    regions = [] /* Which regions to deploy to */,
},  environment /* qa, staging, or production */ )
{
    console.log(`Deploying to ${environment} to ${regions.join(", ")}!`);
}
