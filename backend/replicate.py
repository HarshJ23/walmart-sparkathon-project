import replicate

REPLICATE_API_TOKEN= "r8_NyrHilQCxBCcVdBAAUl0CWGNWZcksnu1Y7Alh"
input = {
    "garm_img": "https://replicate.delivery/pbxt/KgwTlZyFx5aUU3gc5gMiKuD5nNPTgliMlLUWx160G4z99YjO/sweater.webp",
    "human_img": "https://replicate.delivery/pbxt/KgwTlhCMvDagRrcVzZJbuozNJ8esPqiNAIJS3eMgHrYuHmW4/KakaoTalk_Photo_2024-04-04-21-44-45.png",
    "garment_des": "cute pink top"
}

output = replicate.run(
    "cuuupid/idm-vton:906425dbca90663ff5427624839572cc56ea7d380343d13e2a4c4b09d3f0c30f",
    input=input
)
print(output)
#=> "https://replicate.delivery/pbxt/Tfs5JETdzlURKyKeUOltKwch...